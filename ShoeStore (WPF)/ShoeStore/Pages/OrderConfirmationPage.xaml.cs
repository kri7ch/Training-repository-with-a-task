using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.EntityFrameworkCore;
using ShoeStore.Model;

namespace ShoeStore.Pages;

public partial class OrderConfirmationPage : Page
{
    private readonly List<ProductItem> _basket;
    private readonly User? _currentUser;
    private readonly User? _targetUser;

    public OrderConfirmationPage(List<ProductItem> basket, User? currentUser, User? targetUser = null)
    {
        InitializeComponent();
        _basket = basket;
        _currentUser = currentUser;
        _targetUser = targetUser;
        LoadData();
    }

    private void LoadData()
    {
        BasketList.ItemsSource = _basket.ToList();
        UpdateTotals();

        using var db = new DbshopbootsContext();
        
        var pickupPoints = db.PickupPoints.ToList();
        PickupPointCombo.ItemsSource = pickupPoints.Select(p => new PickupPointItem
        {
            Id = p.Id,
            FullAddress = $"{p.AddressIndex}, {p.AddressCity}, {p.AddressStreet}, {p.AddressNumberHouse}"
        }).ToList();

        if (_targetUser != null)
        {
            UserLabel.Visibility = Visibility.Visible;
            UserCombo.Visibility = Visibility.Visible;
            UserCombo.ItemsSource = new List<UserItem> { new UserItem { Id = _targetUser.Id, FullName = $"{_targetUser.Lastname} {_targetUser.Name} {_targetUser.Midname}".Trim() } };
            UserCombo.SelectedIndex = 0;
            UserCombo.IsEnabled = false;
        }
        else if (_currentUser != null && _currentUser.Role == "администратр")
        {
            UserLabel.Visibility = Visibility.Visible;
            UserCombo.Visibility = Visibility.Visible;
            UserCombo.IsEnabled = true;
            var users = db.Users.Where(u => u.Role == "клиент").ToList();
            UserCombo.ItemsSource = users.Select(u => new UserItem
            {
                Id = u.Id,
                FullName = $"{u.Lastname} {u.Name} {u.Midname}".Trim()
            }).ToList();
        }
        else
        {
            UserLabel.Visibility = Visibility.Collapsed;
            UserCombo.Visibility = Visibility.Collapsed;
        }

        if (_currentUser != null && _currentUser.Role == "администратр")
        {
            AddProductToOrderButton.Visibility = Visibility.Visible;
        }
    }

    private void AddProductToOrderButton_Click(object sender, RoutedEventArgs e)
    {
        if (_currentUser != null && _currentUser.Role == "администратр")
        {
            NavigationService.Navigate(new ProductsPage(_currentUser, _targetUser));
        }
    }

    private void UpdateTotals()
    {
        double totalCost = _basket.Sum(p => p.FinalPrice);
        double totalDiscount = _basket.Sum(p => p.Price - p.FinalPrice);

        TotalCostText.Text = $"{totalCost:N2} руб.";
        TotalDiscountText.Text = $"{totalDiscount:N2} руб.";
    }

    private void BackButton_Click(object sender, RoutedEventArgs e)
    {
        NavigationService.GoBack();
    }

    private void DeleteFromBasket_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is int productId)
        {
            var item = _basket.FirstOrDefault(p => p.Id == productId);
            if (item != null)
            {
                _basket.Remove(item);
                LoadData();
                if (_basket.Count == 0)
                {
                    NavigationService.GoBack();
                }
            }
        }
    }

    private async void OrderButton_Click(object sender, RoutedEventArgs e)
    {
        if (PickupPointCombo.SelectedItem == null)
        {
            MessageBox.Show("Выберите пункт выдачи.");
            return;
        }

        if (_basket.Count == 0)
        {
            MessageBox.Show("Корзина пуста.");
            return;
        }

        int targetUserId = _currentUser?.Id ?? 0;
        if (_currentUser != null && _currentUser.Role == "администратр")
        {
            if (UserCombo.SelectedItem is UserItem selectedUser)
            {
                targetUserId = selectedUser.Id;
            }
            else
            {
                MessageBox.Show("Выберите пользователя, для которого оформляется заказ.");
                return;
            }
        }

        try
        {
            using var db = new DbshopbootsContext();
            
            if (PickupPointCombo.SelectedItem is PickupPointItem selectedPickupPoint)
            {
                int pickupPointId = selectedPickupPoint.Id;

                var basketGroups = _basket.GroupBy(p => p.Id).Select(g => new { ProductId = g.Key, Count = g.Count() }).ToList();

                foreach (var group in basketGroups)
                {
                    var storage = db.Storages.FirstOrDefault(s => s.ProductId == group.ProductId);
                    if (storage == null || storage.Count < group.Count)
                    {
                        var product = db.Products.Find(group.ProductId);
                        MessageBox.Show($"Недостаточно товара \"{product?.Name}\" на складе!");
                        return;
                    }
                }

                int orderCode = (db.Orders.Max(o => (int?)o.Code) ?? 0) + 1;
                DateOnly deliveryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7));

                var newOrder = new Order
                {
                    DateOrder = DateOnly.FromDateTime(DateTime.Now),
                    DateDelivery = deliveryDate,
                    PickupPointId = pickupPointId,
                    UserId = targetUserId,
                    Code = orderCode,
                    StatusOrder = "Новый"
                };

                db.Orders.Add(newOrder);
                
                foreach (var group in basketGroups)
                {
                    var storage = db.Storages.First(s => s.ProductId == group.ProductId);
                    storage.Count -= group.Count;
                    
                    var detail = new OrderDetail
                    {
                        Order = newOrder,
                        ProductId = group.ProductId,
                        Count = group.Count,
                        Price = _basket.First(p => p.Id == group.ProductId).FinalPrice
                    };
                    db.OrderDetails.Add(detail);
                }

                await db.SaveChangesAsync();

                MessageBox.Show($"Заказ оформлен! Код получения: {orderCode}");
                _basket.Clear();
                NavigationService.Navigate(new ProductsPage(_currentUser));
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Ошибка при оформлении заказа: {ex.Message}");
        }
    }
}
