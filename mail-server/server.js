const express = require("express")
const nodemailer = require("nodemailer")
const cors = require("cors")
const bodyParser = require("body-parser")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(cors())
app.use(bodyParser.json())

/* ==============================
SMTP CONFIG
============================== */

const transporter = nodemailer.createTransport({
host:"smtp.gmail.com",
port:587,
secure:false,
auth:{
user:"nexdriveadmin@gmail.com",
pass:"clkukalaizoytkci"
}
})

/* ==============================
VEHICLE INVOICE
============================== */

app.post("/send-receipt", async(req,res)=>{

try{

const {
customerEmail,
vehicleName,
vehicleNumber,
distance,
freeKm,
extraDistance,
extraCharge,
pricePerDay,
totalPrice,
paymentMethod,
transactionId
} = req.body

const invoiceNumber = "INV-" + Date.now()
const fileName = `invoice_${Date.now()}.pdf`

const doc = new PDFDocument({size:"A4",margin:50})

doc.pipe(fs.createWriteStream(fileName))

const pageWidth = doc.page.width

/* HEADER */

doc.rect(0,0,pageWidth,90).fill("#f5b301")

const logoPath = path.join(__dirname,"assets","nexdrive-logo.png")

if(fs.existsSync(logoPath)){
doc.image(logoPath,50,25,{width:120})
}

doc.fillColor("black").fontSize(26).text("NexDrive",200,30)
doc.fontSize(12).text("Vehicle Rental Platform",200,60)

doc.fontSize(11)
.text(`Invoice Number: ${invoiceNumber}`,400,30,{align:"right"})
.text(`Date: ${new Date().toLocaleDateString()}`,400,50,{align:"right"})

doc.moveDown(3)

/* CUSTOMER INFO */

doc.fillColor("#f5b301").fontSize(16).text("Customer Information")
doc.fillColor("black").fontSize(12)
.text(`Email: ${customerEmail}`)

doc.moveDown()

/* VEHICLE INFO */

doc.fillColor("#f5b301").fontSize(16).text("Vehicle Details")

doc.fillColor("black").fontSize(12)
.text(`Vehicle: ${vehicleName}`)
.text(`Vehicle Number: ${vehicleNumber}`)
.text(`Distance Travelled: ${distance} KM`)
.text(`Free Distance: ${freeKm} KM`)
.text(`Extra Distance: ${extraDistance} KM`)

doc.moveDown()

/* CHARGES */

doc.fillColor("#f5b301").fontSize(16).text("Charges")

doc.fillColor("black").fontSize(12)
.text(`Base Price: ₹${pricePerDay}`)
.text(`Extra Distance Charge: ₹${extraCharge}`)

doc.moveDown()

doc.fontSize(16).fillColor("#f5b301")
.text(`Total Paid: ₹${totalPrice}`)

doc.moveDown()

/* PAYMENT */

doc.fillColor("#f5b301").fontSize(16).text("Payment Details")

doc.fillColor("black").fontSize(12)
.text(`Payment Method: ${paymentMethod}`)
.text(`Transaction ID: ${transactionId || "N/A"}`)

/* FOOTER */

doc.moveDown(3)

doc.fillColor("#f5b301").fontSize(14)
.text("Thank you for choosing NexDrive!",{align:"center"})

doc.fillColor("black").fontSize(10)
.text("support@nexdrive.com",{align:"center"})

doc.end()

await transporter.sendMail({

from:"nexdriveadmin@gmail.com",
to:customerEmail,
subject:"NexDrive Vehicle Invoice",

html:`

<h2>NexDrive Vehicle Invoice</h2>
<p>Your vehicle rental payment has been confirmed.</p>
<p>Please find the invoice attached.</p>
`,

attachments:[
{
filename:"NexDrive_Vehicle_Invoice.pdf",
path:fileName
}
]

})

setTimeout(()=>{
if(fs.existsSync(fileName)){
fs.unlinkSync(fileName)
}
},5000)

res.json({success:true})

}catch(err){

console.error(err)

res.status(500).json({
error:"Mail failed"
})

}

})

/* ==============================
DRIVER INVOICE
============================== */
app.post("/send-driver-invoice", async(req,res)=>{

try{

const {
customerEmail,
driverName,
date,
pickupLocation,
price,
paymentMethod,
transactionId
} = req.body

const invoiceNumber = "DRV-" + Date.now()
const fileName = `driver_invoice_${Date.now()}.pdf`

const doc = new PDFDocument({size:"A4",margin:50})

doc.pipe(fs.createWriteStream(fileName))

const pageWidth = doc.page.width

/* HEADER BAR */

doc.rect(0,0,pageWidth,90).fill("#f5b301")

const logoPath = path.join(__dirname,"assets","nexdrive-logo.png")

if(fs.existsSync(logoPath)){
doc.image(logoPath,50,25,{width:120})
}

/* BRAND */

doc.fillColor("black")
.fontSize(26)
.text("NexDrive",200,30)

doc.fontSize(12)
.text("Driver Ride Invoice",200,60)

/* INVOICE INFO */

doc.fontSize(11)
.text(`Invoice Number: ${invoiceNumber}`,400,30,{align:"right"})

doc.text(`Date: ${new Date().toLocaleDateString()}`,400,50,{align:"right"})

doc.moveDown(3)

/* CUSTOMER */

doc.fillColor("#f5b301")
.fontSize(16)
.text("Customer Information")

doc.fillColor("black")
.fontSize(12)
.text(`Email: ${customerEmail}`)

doc.moveDown(2)

/* DRIVER DETAILS */

doc.fillColor("#f5b301")
.fontSize(16)
.text("Trip Details")

doc.fillColor("black")
.fontSize(12)

doc.text(`Driver: ${driverName}`)
doc.text(`Trip Date: ${date}`)
doc.text(`Pickup Location: ${pickupLocation}`)

doc.moveDown(2)

/* TABLE HEADER */

const tableTop = doc.y

doc.rect(50,tableTop,500,25).fill("#f5b301")

doc.fillColor("black")
.fontSize(12)

doc.text("Description",60,tableTop+7)
doc.text("Amount",450,tableTop+7,{align:"right"})

/* DRIVER FEE ROW */

const row1 = tableTop + 40

doc.text("Driver Service Fee",60,row1)

doc.text(`₹ ${price}`,450,row1,{align:"right"})

/* LINE */

doc.moveTo(50,row1+20)
.lineTo(550,row1+20)
.stroke()

/* TOTAL */

const totalY = row1 + 40

doc.rect(50,totalY,500,35).fill("#f5b301")

doc.fillColor("black")
.fontSize(16)

doc.text("Total Paid",60,totalY+10)
doc.text(`₹ ${price}`,450,totalY+10,{align:"right"})

/* PAYMENT DETAILS */

doc.moveDown(4)

doc.fillColor("#f5b301")
.fontSize(16)
.text("Payment Details")

doc.fillColor("black")
.fontSize(12)

doc.text(`Payment Method: ${paymentMethod}`)
doc.text(`Transaction ID: ${transactionId || "N/A"}`)

/* FOOTER */

doc.moveDown(4)

doc.fillColor("#f5b301")
.fontSize(14)
.text("Thank you for choosing NexDrive!",{
align:"center"
})

doc.moveDown()

doc.fillColor("black")
.fontSize(10)
.text("support@nexdrive.com",{align:"center"})

doc.end()

/* SEND EMAIL */

await transporter.sendMail({

from:"nexdriveadmin@gmail.com",

to:customerEmail,

subject:"NexDrive Driver Invoice",

html:`

<h2>Your NexDrive Driver Invoice</h2>
<p>Your driver trip payment has been confirmed.</p>
<p>Please find the invoice attached.</p>

`,

attachments:[
{
filename:"NexDrive_Driver_Invoice.pdf",
path:fileName
}
]

})

setTimeout(()=>{
if(fs.existsSync(fileName)){
fs.unlinkSync(fileName)
}
},5000)

res.json({success:true})

}catch(err){

console.error(err)

res.status(500).json({
error:"Driver invoice failed"
})

}

})