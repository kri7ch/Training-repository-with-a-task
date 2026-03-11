using System;
using System.Linq;
using System.Windows;
using ShoeStore.Model;

namespace ShoeStore.Windows;

public partial class SelectUserWindow : Window
{
    public User? SelectedUser { get; private set; }

    public SelectUserWindow()
    {
        InitializeComponent();
        LoadUsers();
    }

    private void LoadUsers()
    {
        using var db = new DbshopbootsContext();
        var users = db.Users.Where(u => u.Role == "клиент").ToList();
        UsersList.ItemsSource = users.Select(u => new UserItem
        {
            Id = u.Id,
            FullName = $"{u.Lastname} {u.Name} {u.Midname}".Trim(),
            Role = u.Role,
            UserObject = u
        }).ToList();
    }

    private void SelectButton_Click(object sender, RoutedEventArgs e)
    {
        if (UsersList.SelectedItem is UserItem selectedItem)
        {
            SelectedUser = selectedItem.UserObject;
            DialogResult = true;
            Close();
        }
        else
        {
            MessageBox.Show("Пожалуйста, выберите пользователя из списка.");
        }
    }

    private void CancelButton_Click(object sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}
