require("dotenv").config()
const express = require("express")
const nodemailer = require("nodemailer")
const cors = require("cors")
const bodyParser = require("body-parser")
const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

const app = express()

app.use(cors())
app.use(bodyParser.json())

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"

/* ==========================
SMTP CONFIG
========================== */

const transporter = nodemailer.createTransport({
host:"smtp.gmail.com",
port:587,
secure:false,
auth:{
user:process.env.EMAIL_USER || "nexdriveadmin@gmail.com",
pass:process.env.EMAIL_PASS || "clkukalaizoytkci"
}
})

/* ==========================
CONVERT COORDINATES → ADDRESS
========================== */

async function getAddressFromCoords(coords){

try{

if(!coords) return "Location not provided"

const [lat,lng] = coords.split(",")

const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`

const response = await axios.get(url)

if(response.data.results.length>0){
return response.data.results[0].formatted_address
}

return coords

}catch(err){
console.log("Geocode failed:",err.message)
return coords
}

}

/* ==========================
VEHICLE INVOICE
========================== */

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

const invoiceNumber = "INV-"+Date.now()

const fileName = `vehicle_invoice_${Date.now()}.pdf`

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

doc.fontSize(12).text("Vehicle Rental Invoice",200,60)

doc.fontSize(11)

doc.text(`Invoice: ${invoiceNumber}`,400,30,{align:"right"})

doc.text(`Date: ${new Date().toLocaleDateString()}`,400,50,{align:"right"})

doc.moveDown(3)

/* CUSTOMER */

doc.fillColor("#f5b301").fontSize(16).text("Customer Information")

doc.fillColor("black").fontSize(12)

doc.text(`Email: ${customerEmail}`,{
width:400
})

doc.moveDown()

/* VEHICLE DETAILS */

doc.fillColor("#f5b301").fontSize(16).text("Vehicle Details")

doc.fillColor("black").fontSize(12)

doc.text(`Vehicle: ${vehicleName}`)

doc.text(`Vehicle Number: ${vehicleNumber}`)

doc.text(`Distance Travelled: ${distance} KM`)

doc.text(`Free Distance: ${freeKm} KM`)

doc.text(`Extra Distance: ${extraDistance} KM`)

doc.moveDown()

/* TABLE HEADER */

const tableTop = doc.y

doc.rect(50,tableTop,500,25).fill("#f5b301")

doc.fillColor("black")

doc.text("Description",60,tableTop+7)

doc.text("Amount",450,tableTop+7,{align:"right"})

/* ROWS */

const row = tableTop+40

doc.text("Base Price",60,row)

doc.text(`₹${pricePerDay.toLocaleString()}`,450,row,{align:"right"})

doc.moveDown()

doc.text("Extra Distance Charge",60,row+20)

doc.text(`₹${extraCharge.toLocaleString()}`,450,row+20,{align:"right"})

/* TOTAL */

const totalY = row+60

doc.rect(50,totalY,500,35).fill("#f5b301")

doc.fillColor("black").fontSize(16)

doc.text("Total Paid",60,totalY+10)

doc.text(`₹${totalPrice.toLocaleString()}`,450,totalY+10,{align:"right"})

doc.moveDown(4)

/* PAYMENT */

doc.fillColor("#f5b301").fontSize(16).text("Payment Details")

doc.fillColor("black").fontSize(12)

doc.text(`Method: ${paymentMethod}`)

doc.text(`Transaction ID: ${transactionId || "N/A"}`)

/* FOOTER */

doc.moveDown(4)

doc.fillColor("#f5b301").fontSize(14)

doc.text("Thank you for choosing NexDrive!",{align:"center"})

doc.fillColor("black").fontSize(10)

doc.text("support@nexdrive.com",{align:"center"})

doc.end()

/* SEND EMAIL */

await transporter.sendMail({

from:"nexdriveadmin@gmail.com",

to:customerEmail,

subject:"NexDrive Vehicle Invoice",

html:`<h2>Your NexDrive Vehicle Invoice</h2>
<p>Your vehicle booking payment has been confirmed.</p>
<p>Please find the invoice attached.</p>`,

attachments:[
{
filename:"NexDrive_Vehicle_Invoice.pdf",
path:fileName
}
]

})

setTimeout(()=>{

if(fs.existsSync(fileName)) fs.unlinkSync(fileName)

},5000)

res.json({success:true})

}catch(err){

console.error(err)

res.status(500).json({error:"Mail failed"})

}

})

/* ==========================
DRIVER INVOICE
========================== */

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

const address = await getAddressFromCoords(pickupLocation)

const invoiceNumber = "DRV-"+Date.now()

const fileName = `driver_invoice_${Date.now()}.pdf`

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

doc.fontSize(12).text("Driver Ride Invoice",200,60)

doc.fontSize(11)

doc.text(`Invoice: ${invoiceNumber}`,400,30,{align:"right"})

doc.text(`Date: ${new Date().toLocaleDateString()}`,400,50,{align:"right"})

doc.moveDown(3)

/* CUSTOMER */

doc.fillColor("#f5b301").fontSize(16).text("Customer Information")

doc.fillColor("black").fontSize(12)

doc.text(`Email: ${customerEmail}`,{width:400})

doc.moveDown(2)

/* TRIP */

doc.fillColor("#f5b301").fontSize(16).text("Trip Details")

doc.fillColor("black").fontSize(12)

doc.text(`Driver: ${driverName}`)

doc.text(`Trip Date: ${date}`)

doc.text(`Pickup Location:`)

doc.text(address,{width:400})

doc.moveDown(2)

/* TABLE */

const tableTop = doc.y

doc.rect(50,tableTop,500,25).fill("#f5b301")

doc.fillColor("black")

doc.text("Description",60,tableTop+7)

doc.text("Amount",450,tableTop+7,{align:"right"})

const row = tableTop+40

doc.text("Driver Service Fee",60,row)

doc.text(`₹${price.toLocaleString()}`,450,row,{align:"right"})

/* TOTAL */

const totalY = row+40

doc.rect(50,totalY,500,35).fill("#f5b301")

doc.fillColor("black").fontSize(16)

doc.text("Total Paid",60,totalY+10)

doc.text(`₹${price.toLocaleString()}`,450,totalY+10,{align:"right"})

doc.moveDown(4)

/* PAYMENT */

doc.fillColor("#f5b301").fontSize(16).text("Payment Details")

doc.fillColor("black").fontSize(12)

doc.text(`Method: ${paymentMethod}`)

doc.text(`Transaction ID: ${transactionId || "N/A"}`)

doc.moveDown(4)

/* FOOTER */

doc.fillColor("#f5b301").fontSize(14)

doc.text("Thank you for choosing NexDrive!",{align:"center"})

doc.fillColor("black").fontSize(10)

doc.text("support@nexdrive.com",{align:"center"})

doc.end()

await transporter.sendMail({

from:"nexdriveadmin@gmail.com",

to:customerEmail,

subject:"NexDrive Driver Invoice",

html:`<h2>Your NexDrive Driver Invoice</h2>
<p>Your driver booking payment has been confirmed.</p>
<p>Please find the invoice attached.</p>`,

attachments:[
{
filename:"NexDrive_Driver_Invoice.pdf",
path:fileName
}
]

})

setTimeout(()=>{

if(fs.existsSync(fileName)) fs.unlinkSync(fileName)

},5000)

res.json({success:true})

}catch(err){

console.error(err)

res.status(500).json({error:"Driver invoice failed"})

}

})

/* ==========================
SERVER START
========================== */

const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
console.log(`Mail server running on port ${PORT}`)
})