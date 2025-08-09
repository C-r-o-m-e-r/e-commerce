// backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// This is the data we want to add to the database
const categoryData = [
    {
        name: 'Electronics',
        subcategories: [
            {
                name: 'Computers & Laptops',
                subcategories: [
                    { name: 'Laptops' },
                    { name: 'Desktops' },
                    { name: 'Monitors' },
                ],
            },
            {
                name: 'Phones & Accessories',
                subcategories: [
                    { name: 'Smartphones' },
                    { name: 'Cases & Covers' },
                    { name: 'Headphones' },
                ],
            },
            { name: 'Cameras & Drones' },
        ],
    },
    {
        name: 'Fashion & Apparel',
        subcategories: [
            {
                name: 'Men\'s Clothing',
                subcategories: [
                    { name: 'T-Shirts & Polos' },
                    { name: 'Jeans & Trousers' },
                    { name: 'Jackets' },
                ],
            },
            {
                name: 'Women\'s Clothing',
                subcategories: [
                    { name: 'Dresses & Skirts' },
                    { name: 'Tops & Blouses' },
                    { name: 'Activewear' },
                ],
            },
            { name: 'Shoes & Footwear' },
            { name: 'Watches & Jewelry' },
        ],
    },
    {
        name: 'Home & Garden',
        subcategories: [
            { name: 'Furniture' },
            { name: 'Kitchen & Dining' },
            { name: 'Home Decor' },
            { name: 'Gardening Tools' },
        ],
    },
    {
        name: 'Books & Literature',
        subcategories: [
            { name: 'Fiction' },
            { name: 'Non-Fiction' },
            { name: 'Science & Technology' },
            { name: 'Comics & Graphic Novels' },
        ],
    },
    { name: 'Sports & Outdoors' },
];

// This function recursively creates categories and their subcategories
async function createCategory(category, parentId = null) {
    const createdCategory = await prisma.category.create({
        data: {
            name: category.name,
            parentId: parentId,
        },
    });

    console.log(`Created category: ${category.name}`);

    if (category.subcategories && category.subcategories.length > 0) {
        for (const sub of category.subcategories) {
            await createCategory(sub, createdCategory.id);
        }
    }
}

// Main function to run the seeding process
async function main() {
    console.log(`Start seeding ...`);

    // First, delete all existing categories to start fresh
    await prisma.category.deleteMany({});
    console.log('Deleted all old categories.');

    for (const cat of categoryData) {
        await createCategory(cat);
    }
    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });