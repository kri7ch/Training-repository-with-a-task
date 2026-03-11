using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using ShoeStore.Model;

namespace ShoeStore.Windows;

public partial class OrderEditWindow : Window
{
    private readonly Order _order;

    public OrderEditWindow(Order order)
    {
        InitializeComponent();
        _order = order;
        LoadData();
    }

    private void LoadData()
    {
        foreach (ComboBoxItem item in StatusComboBox.Items)
        {
            if (item.Content.ToString() == _order.StatusOrder)
            {
                StatusComboBox.SelectedItem = item;
                break;
            }
        }

        DeliveryDatePicker.SelectedDate = _order.DateDelivery.ToDateTime(TimeOnly.MinValue);
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (StatusComboBox.SelectedItem == null)
        {
            MessageBox.Show("Выберите статус.");
            return;
        }

        if (DeliveryDatePicker.SelectedDate == null)
        {
            MessageBox.Show("Выберите дату доставки.");
            return;
        }

        try
        {
            using var db = new DbshopbootsContext();
            var orderToUpdate = db.Orders.FirstOrDefault(o => o.Id == _order.Id);
            if (orderToUpdate != null)
            {
                orderToUpdate.StatusOrder = ((ComboBoxItem)StatusComboBox.SelectedItem).Content.ToString()!;
                orderToUpdate.DateDelivery = DateOnly.FromDateTime(DeliveryDatePicker.SelectedDate.Value);
                
                db.SaveChanges();
                MessageBox.Show("Заказ обновлен.");
                DialogResult = true;
                Close();
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Ошибка при сохранении: {ex.Message}");
        }
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
