using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Navigation;
using Microsoft.EntityFrameworkCore;
using ShoeStore.Model;

namespace ShoeStore.Pages;

public partial class OrdersPage : Page
{
    private readonly User? _currentUser;
    public bool IsAdmin => _currentUser != null && _currentUser.Role == "администратр";

    public OrdersPage(User? currentUser)
    {
        InitializeComponent();
        _currentUser = currentUser;
        DataContext = this;
        LoadOrders();
    }

    private void LoadOrders()
    {
        using var db = new DbshopbootsContext();
        
        var orders = db.Orders.Include(o => o.PickupPoint).OrderByDescending(o => o.DateOrder)
            .Select(o => new OrderItem
            {
                Id = o.Id,
                Code = o.Code,
                StatusOrder = o.StatusOrder,
                DateOrder = o.DateOrder,
                DateDelivery = o.DateDelivery,
                PickupAddress = $"{o.PickupPoint.AddressIndex}, {o.PickupPoint.AddressCity}, {o.PickupPoint.AddressStreet}, {o.PickupPoint.AddressNumberHouse}",
                AdminEditVisibility = (_currentUser != null && _currentUser.Role == "администратр" && o.StatusOrder != "Завершен") ? Visibility.Visible : Visibility.Collapsed,
            }).ToList();

        OrdersList.ItemsSource = orders;
    }

    private void CreateOrderButton_Click(object sender, RoutedEventArgs e)
    {
        var selectUserWindow = new Windows.SelectUserWindow();
        if (selectUserWindow.ShowDialog() == true && selectUserWindow.SelectedUser != null)
        {
            ProductsPage.ClearBasket();
            NavigationService.Navigate(new ProductsPage(_currentUser, selectUserWindow.SelectedUser));
        }
    }

    private void EditOrderButton_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button button && button.Tag is int orderId)
        {
            using var db = new DbshopbootsContext();
            var order = db.Orders.FirstOrDefault(o => o.Id == orderId);
            if (order != null)
            {
                var editWindow = new Windows.OrderEditWindow(order);
                if (editWindow.ShowDialog() == true)
                {
                    LoadOrders();
                }
            }
        }
    }

    private void BackButton_Click(object sender, RoutedEventArgs e)
    {
        if (NavigationService.CanGoBack)
        {
            NavigationService.GoBack();
        }
        else
        {
            NavigationService.Navigate(new ProductsPage(_currentUser));
        }
    }

    private class OrderItem
    {
        public int Id { get; set; }
        public int Code { get; set; }
        public string StatusOrder { get; set; } = "";
        public DateOnly DateOrder { get; set; }
        public DateOnly DateDelivery { get; set; }
        public string PickupAddress { get; set; } = "";
        public Visibility AdminEditVisibility { get; set; }
    }
}