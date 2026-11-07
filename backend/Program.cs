// Create the builder to configure the web app, including settings, logging, and services. (Prepares configuration)
var builder = WebApplication.CreateBuilder(args);

// Register services that generate documentation describing our API endpoints. (Prepares the service container)
builder.Services.AddOpenApi();

// Build the configured web application so we can define its request handling and endpoints. (Prepares the request pipeline)
var app = builder.Build();

// Expose the OpenAPI documentation endpoint only when running in a development environment. (Configures the request pipeline)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// List of products to return from the API endpoint. (Defines the data model)
var products = new List<Product>
{
    new(1, "Classic T-Shirt", "Tops", 24.99m,
        ["S", "M", "L", "XL"], ["Black", "White"]),
    new(2, "Everyday Hoodie", "Hoodies", 54.99m,
        ["M", "L", "XL"], ["Black", "Gray"]),
    new(3, "Straight-Leg Jeans", "Jeans", 64.99m,
        ["30", "32", "34"], ["Indigo", "Black"])
};

// Handle GET requests to /api/products.
app.MapGet("/api/products", () =>
{
    // Return the products as JSON with HTTP status 200 OK.
    return Results.Ok(products);
})
.WithName("GetProducts"); // Give this endpoint a unique internal name.

app.MapPost("/api/checkout", (CheckoutRequest request) =>
{
    if (request.Items is not { Length: > 0 })
        return Results.BadRequest(new { message = "Your cart is empty." });

    decimal total = 0;

    foreach (var item in request.Items)
    {
        if (item is null || item.Quantity is < 1 or > 99)
            return Results.BadRequest(new { message = "Quantity must be between 1 and 99." });

        var product = products.Find(product => product.Id == item.ProductId);

        if (product is null)
            return Results.BadRequest(new { message = "A product is no longer available." });

        if (!product.Sizes.Contains(item.Size) || !product.Colors.Contains(item.Color))
            return Results.BadRequest(new { message = $"Invalid size or color for {product.Name}." });

        total += product.Price * item.Quantity;
    }

    return Results.Ok(new { confirmationId = Guid.NewGuid(), total });
});

app.Run();

// Define the "Product" data structure
record Product(
    int Id,
    string Name,
    string Category,
    decimal Price,
    string[] Sizes,
    string[] Colors
);

record CheckoutRequest(CheckoutItem?[]? Items);
record CheckoutItem(int ProductId, string Size, string Color, int Quantity);