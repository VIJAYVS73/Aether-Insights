
async function test() {
  try {
    const res = await fetch('https://dummyjson.com/products?limit=100');
    const data = await res.json();
    console.log('Limit requested: 100');
    console.log('Products length:', data.products?.length);
    console.log('Metadata limit:', data.limit);
    console.log('Categories found:', [...new Set(data.products?.map(p => p.category))]);
  } catch (e) {
    console.error(e);
  }
}
test();
