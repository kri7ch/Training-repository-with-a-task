using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using ShoeStore.Model;

namespace ShoeStore.Pages;

public partial class ProductsPage : Page
    {
        private readonly User? _currentUser;
        private readonly User? _targetUser;
        private List<ProductItem> _allItems = new();
        private static List<ProductItem> _basket = new();

        public static void ClearBasket()
        {
            _basket.Clear();
        }

        public bool IsAdminOrManager => _currentUser != null && (_currentUser.Role == "менеджер" || _currentUser.Role == "администратр");
        public bool IsOrderMode => _targetUser != null;
        public string TargetUserName => _targetUser != null ? $"{_targetUser.Lastname} {_targetUser.Name} {_targetUser.Midname}".Trim() : "";
        public bool ShowCatalogAddButton => IsAdminOrManager && !IsOrderMode;

        public ProductsPage(User? currentUser, User? targetUser = null)
        {
            InitializeComponent();
            _currentUser = currentUser;
            _targetUser = targetUser;
            DataContext = this;

            if (IsAdminOrManager)
            {
                OrdersButton.Visibility = System.Windows.Visibility.Visible;
                AddProductButton.Visibility = System.Windows.Visibility.Visible;
            }

            if (_targetUser != null)
            {
                MessageBox.Show($"Оформление заказа для пользователя: {_targetUser.Lastname} {_targetUser.Name}");
            }

            UpdateBasketButtonVisibility();
            LoadProducts();
        }

        private void UpdateBasketButtonVisibility()
        {
            if (_basket.Count > 0)
            {
                BasketButton.Visibility = Visibility.Visible;
                BasketButton.Content = IsOrderMode ? $"Оформить заказ ({_basket.Count})" : $"Корзина ({_basket.Count})";
            }
            else
            {
                BasketButton.Visibility = Visibility.Collapsed;
            }
        }

        private void AddToOrder_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (ProductsList.SelectedItem is ProductItem selectedProduct)
            {
                int currentInBasket = _basket.Count(p => p.Id == selectedProduct.Id);
                if (currentInBasket >= selectedProduct.StockCount)
                {
                    MessageBox.Show("Недостаточно товара на складе!", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                _basket.Add(selectedProduct);
                UpdateBasketButtonVisibility();
                MessageBox.Show($"Товар \"{selectedProduct.Name}\" добавлен в заказ пользователя: {_targetUser?.Lastname} {_targetUser?.Name}");
            }
        }

        private void DirectAddToOrder_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is int productId)
            {
                var selectedProduct = _allItems.FirstOrDefault(p => p.Id == productId);
                if (selectedProduct != null)
                {
                    int currentInBasket = _basket.Count(p => p.Id == selectedProduct.Id);
                    if (currentInBasket >= selectedProduct.StockCount)
                    {
                        MessageBox.Show("Недостаточно товара на складе!", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                        return;
                    }

                    _basket.Add(selectedProduct);
                    UpdateBasketButtonVisibility();
                    MessageBox.Show($"Товар \"{selectedProduct.Name}\" добавлен в заказ пользователя: {_targetUser?.Lastname} {_targetUser?.Name}");
                }
            }
        }

        private void BasketButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            NavigationService.Navigate(new OrderConfirmationPage(_basket, _currentUser, _targetUser));
        }

        private void LoadProducts()
        {
            using var db = new DbshopbootsContext();

            var baseQuery =
                db.Products.Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Discount,
                    Description = p.Description,
                    CategoryName = p.Category.Name,
                    ManufacturerName = p.Manufacture.Name,
                    SupplierName = p.Supplier.Name,
                    Unit = db.Storages.Where(s => s.ProductId == p.Id).Select(s => s.Unit).FirstOrDefault(),
                    StockCountNullable = db.Storages.Where(s => s.ProductId == p.Id).Sum(s => (int?)s.Count),
                    ImageName = db.Images.Where(i => i.ProductId == p.Id).Select(i => i.Image1).FirstOrDefault()
                });

            _allItems = baseQuery
                .AsEnumerable()
                .Select(b => new ProductItem
                {
                    Id = b.Id,
                    Name = b.Name,
                    Price = b.Price,
                    Discount = b.Discount,
                    Description = b.Description ?? "",
                    CategoryName = b.CategoryName,
                    ManufacturerName = b.ManufacturerName,
                    SupplierName = b.SupplierName,
                    Unit = string.IsNullOrWhiteSpace(b.Unit) ? "шт." : b.Unit!,
                    StockCount = b.StockCountNullable ?? 0,
                    ImageName = b.ImageName,
                    FinalPrice = Math.Round(b.Price * (100 - b.Discount) / 100.0, 2),
                    PhotoUri = string.IsNullOrWhiteSpace(b.ImageName)
                        ? "/Resource/Icons/picture.png"
                        : $"/Resource/Products/{b.ImageName}",
                    CategoryAndName = $"{b.CategoryName} | {b.Name}",
                    IsBigDiscount = b.Discount > 15,
                    IsDiscounted = b.Discount > 0
                })
                .ToList();

            UpdateList();
        }

        private void UpdateList()
        {
            var filtered = _allItems.AsEnumerable();

            var searchTxt = SearchBox.Text.ToLower().Trim();
            if (!string.IsNullOrEmpty(searchTxt))
            {
                filtered = filtered.Where(p => 
                    p.Name.ToLower().Contains(searchTxt) || 
                    p.Description.ToLower().Contains(searchTxt));
            }

            if (FilterCombo.SelectedIndex == 1)
                filtered = filtered.Where(p => p.Discount >= 0 && p.Discount < 10);
            else if (FilterCombo.SelectedIndex == 2)
                filtered = filtered.Where(p => p.Discount >= 10 && p.Discount < 15);
            else if (FilterCombo.SelectedIndex == 3)
                filtered = filtered.Where(p => p.Discount >= 15);

            if (SortCombo.SelectedIndex == 1)
                filtered = filtered.OrderBy(p => p.FinalPrice);
            else if (SortCombo.SelectedIndex == 2)
                filtered = filtered.OrderByDescending(p => p.FinalPrice);

            var result = filtered.ToList();
            ProductsList.ItemsSource = result;
            RecordsCountText.Text = $"{result.Count} из {_allItems.Count}";
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e) => UpdateList();
        private void SortCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateList();
        private void FilterCombo_SelectionChanged(object sender, SelectionChangedEventArgs e) => UpdateList();

        private void AddProductButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            var editWindow = new Windows.ProductEditWindow(null, _currentUser!);
            editWindow.ProductUpdated += LoadProducts;
            editWindow.ShowDialog();
        }

        private void EditProductButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is int productId)
            {
                using var db = new DbshopbootsContext();
                var product = db.Products.FirstOrDefault(p => p.Id == productId);
                if (product != null)
                {
                     var editWindow = new Windows.ProductEditWindow(product, _currentUser!);
                     editWindow.ProductUpdated += LoadProducts;
                     editWindow.ShowDialog();
                }
            }
        }

        private void OrdersButton_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            NavigationService.Navigate(new OrdersPage(_currentUser));
        }
    
}
