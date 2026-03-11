using ShoeStore.Model;

namespace ShoeStore.Model;

public class UserItem
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Role { get; set; } = "";
    public User UserObject { get; set; } = null!;
}

public class PickupPointItem
{
    public int Id { get; set; }
    public string FullAddress { get; set; } = "";
}
