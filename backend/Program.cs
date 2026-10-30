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
    new(1, "Classic T-Shirt", "Tops", 24.99m),
    new(2, "Everyday Hoodie", "Hoodies", 54.99m),
    new(3, "Straight-Leg Jeans", "Jeans", 64.99m)
};

// Handle GET requests to /api/products.
app.MapGet("/api/products", () =>
{
    // Return the products as JSON with HTTP status 200 OK.
    return Results.Ok(products);
})
.WithName("GetProducts"); // Give this endpoint a unique internal name.

app.Run();

// Define the "Product" data structure
record Product(
    int Id,
    string Name,
    string Category,
    decimal Price
);
