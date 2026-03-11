using System;

namespace ShoeStore.Model;

public class ProductItem
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public double Price { get; set; }
    public int Discount { get; set; }
    public string Description { get; set; } = "";
    public string CategoryName { get; set; } = "";
    public string ManufacturerName { get; set; } = "";
    public string SupplierName { get; set; } = "";
    public string Unit { get; set; } = "шт.";
    public int StockCount { get; set; }
    public string? ImageName { get; set; }
    public string PhotoUri { get; set; } = "";
    public double FinalPrice { get; set; }
    public string CategoryAndName { get; set; } = "";
    public bool IsBigDiscount { get; set; }
    public bool IsDiscounted { get; set; }
}
