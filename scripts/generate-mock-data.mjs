import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../src/data/db')

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pick = (arr) => arr[rand(0, arr.length - 1)]
const pad  = (n, len) => String(n).padStart(len, '0')
const save = (name, data) => {
  writeFileSync(`${OUT}/${name}.json`, JSON.stringify(data, null, 2))
  console.log(`  ✓ ${name}.json — ${data.length} rows`)
}

// ─── ID formatters ────────────────────────────────────────────────────────────

const customerId  = (n) => `CT-${pad(n, 4)}`
const warehouseId = (n) => `WH-${pad(n, 3)}`
const supplierId  = (n) => `SP-${pad(n, 3)}`
const productId   = (n) => `P-${pad(n, 3)}`
const orderId     = (n) => `ORDER-${pad(n, 4)}`
const subOrderId  = (orderN, seq) => `ORDER-${pad(orderN, 4)}-${pad(seq, 3)}`

// ─── Static reference data ────────────────────────────────────────────────────

const CUSTOMER_NAMES = [
  'Nordic Fresh Co.','Pacific Traders Ltd.','Sunrise Seafood','Euro Delicatessen',
  'Metro Supermart','Island Gourmet','Royal Cuisine Co.','Green Table Foods',
  'Luxe Hotel Group','Fresh Market PLC','Ocean Harvest Inc.','Polar Fish Co.',
  'Atlantic Catch Ltd.','Blue Wave Trading','Silver Stream Foods','Arctic Pearl Co.',
  'Nordic Catch Inc.','Seafood Paradise','Marine Delights','Pacific Blue Ltd.',
  'Northern Star Foods','Crystal Waters Co.','Deep Blue Trading','Fjord Fresh Inc.',
  'Wave Crest Foods','Sea Breeze Ltd.','Harbor Fresh Co.','Coastal Gourmet',
  'Tidal Wave Foods','Reef Fresh Trading','Coral Bay Co.','Peninsula Foods Inc.',
  'Glacier Fresh Ltd.','Iceberg Trading Co.','Tundra Fish Inc.','Boreal Seafood',
  'Taiga Fresh Co.','Cascade Foods Inc.','Summit Fresh Co.','Valley Gourmet Ltd.',
  'Delta Trading Inc.','Estuary Foods Co.','Lagoon Fresh Ltd.','Bayou Trading Inc.',
  'Inlet Seafood Co.','Cove Fresh Ltd.','Sound Foods Inc.','Strait Trading Co.',
  'Channel Fresh Ltd.','Archipelago Foods',
]

const customers = CUSTOMER_NAMES.map((name, i) => {
  const tier  = i % 10 < 2 ? 'low' : i % 10 < 6 ? 'mid' : 'high'
  const credit = tier === 'low'  ? rand(500,   4_000)
               : tier === 'mid'  ? rand(8_000,  80_000)
               :                   rand(150_000, 2_000_000)
  return { customer_id: customerId(i + 1), customer_name: name, credit }
})

const WAREHOUSE_NAMES = [
  'BKK Central Depot','BKK North Hub','Chiang Mai Hub','Phuket Store',
  'DMK Cold Storage','Hat Yai Depot','Korat Warehouse','Chonburi Hub',
  'Samui Cold Store','Khon Kaen Depot',
]
const warehouses = WAREHOUSE_NAMES.map((name, i) => ({
  warehouse_id:   warehouseId(i + 1),
  warehouse_name: name,
}))

const SUPPLIER_NAMES = [
  'AquaFarm AS','FjordFish AB','NorSalmon AS',
  'SeaHarvest Co.','Arctic Catch Ltd.','Iceland Fish Co.',
]
const suppliers = SUPPLIER_NAMES.map((name, i) => ({
  supplier_id:   supplierId(i + 1),
  supplier_name: name,
}))

const PRODUCT_DATA = [
  ['Atlantic Salmon 5kg', 50],
  ['Salmon Fillet 1kg',   45],
  ['Whole Salmon 3kg',    40],
  ['Smoked Salmon 500g',  55],
  ['Salmon Steak 2kg',    48],
  ['Salmon Portions 250g',52],
]
const products = PRODUCT_DATA.map(([name, price], i) => ({
  product_id:    productId(i + 1),
  product_name:  name,
  product_price: price,
}))

// WAREHOUSE_SUPPLIER_PRODUCTS — ID is composite: ${warehouse_id}-${supplier_id}-${product_id}
const warehouseSupplierProducts = []
for (const wh of warehouses) {
  const count = rand(6, 14)
  const seen = new Set()
  while (seen.size < count) {
    const sup  = pick(suppliers)
    const prod = pick(products)
    const key  = `${wh.warehouse_id}-${sup.supplier_id}-${prod.product_id}`
    if (!seen.has(key)) {
      seen.add(key)
      const roll  = rand(1, 10)
      const stock = roll <= 1 ? 0
                  : roll <= 3 ? rand(5,   80)
                  : roll <= 6 ? rand(100, 800)
                  :             rand(1_000, 15_000)
      warehouseSupplierProducts.push({
        warehouse_supplier_product_id: key,
        warehouse_id: wh.warehouse_id,
        supplier_id:  sup.supplier_id,
        product_id:   prod.product_id,
        stock,
      })
    }
  }
}

// ─── Orders + SubOrders ───────────────────────────────────────────────────────

const TYPES   = ['EMERGENCY','EMERGENCY','OVER_DUE','OVER_DUE','OVER_DUE','DAILY','DAILY','DAILY','DAILY','DAILY']
const METHODS = ['AUTO','AUTO','AUTO','AUTO','MANUAL']

const GENERIC_REMARKS = ['','','','','Rush order','Standard delivery','Bulk order','Seasonal stock','Export batch','']
const VIP_REMARKS     = ['Special for VIP','VIP customer priority','Premium client order']
const CREDIT_REMARKS  = ['Credit blocked','Credit limit reached','Pending credit approval','Insufficient credit']
const STOCK_REMARKS   = ['Low stock','Stock shortage','Partial stock available','Awaiting restock']

const datePool = []
for (let m = 1; m <= 6; m++)
  for (let d = 1; d <= 28; d++)
    datePool.push(`${pad(m, 2)}/${pad(d, 2)}/2026`)

const orders    = []
const suborders = []
let orderSeq = 1
let totalSo  = 0
const TARGET = 5_000

const productPriceMap = new Map(products.map(p => [p.product_id, p.product_price]))

while (totalSo < TARGET) {
  const remaining     = TARGET - totalSo
  const suborderCount = Math.min(rand(2, 9), remaining)
  const custIdx       = rand(0, customers.length - 1)
  const customer      = customers[custIdx]

  const oid = orderId(orderSeq)
  orders.push({ order_id: oid, customer_id: customer.customer_id, create_date: pick(datePool) })

  for (let s = 0; s < suborderCount; s++) {
    const wsp   = pick(warehouseSupplierProducts)
    const price = productPriceMap.get(wsp.product_id) ?? 50
    const type  = pick(TYPES)

    const request = type === 'EMERGENCY' ? rand(50,  800)
                  : type === 'OVER_DUE'  ? rand(30,  600)
                  :                        rand(10,  300)

    const isLowCredit  = customer.credit < request * price
    const isLowStock   = wsp.stock < request * 0.4
    const isOutOfStock = wsp.stock === 0

    let remark = ''
    if (isOutOfStock)       remark = 'Out of stock'
    else if (isLowStock)    remark = pick(STOCK_REMARKS)
    else if (isLowCredit)   remark = pick(CREDIT_REMARKS)
    else if (customer.credit > 500_000 && rand(1, 5) === 1) remark = pick(VIP_REMARKS)
    else                    remark = pick(GENERIC_REMARKS)

    suborders.push({
      sub_order_id:                  subOrderId(orderSeq, s + 1),
      order_id:                      oid,
      warehouse_supplier_product_id: wsp.warehouse_supplier_product_id,
      request,
      allocated_qty: 0,
      type,
      allocation_method: pick(METHODS),
      status:            'PENDING',
      remark,
    })
  }

  orderSeq++
  totalSo += suborderCount
}

// ─── Write ────────────────────────────────────────────────────────────────────

console.log('\nGenerating mock data...')
save('customers',                   customers)
save('orders',                      orders)
save('warehouses',                  warehouses)
save('suppliers',                   suppliers)
save('products',                    products)
save('warehouse_supplier_products', warehouseSupplierProducts)
save('suborders',                   suborders)
console.log(`\nDone — ${suborders.length} sub-orders across ${orders.length} orders.\n`)
