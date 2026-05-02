import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Copy, 
  MessageCircle, 
  Check,
  FileText,
  MapPin,
  Loader2,
  Truck
} from 'lucide-react';

// ==========================================
// 1. CONSTANTS & DATABASES
// ==========================================

const SQ_INCH_RATE = 0.50;
const PACKAGING_COST = 20;

const PRICING_SLABS = [
  { label: '0–9m', max: 9.99, price: 225 },
  { label: '10–24m', max: 24.99, price: 213 },
  { label: '25–49m', max: 49.99, price: 201 },
  { label: '50–99m', max: 99.99, price: 189 },
  { label: '100m+', max: Infinity, price: 177 }
];

const shippingPartners = {
  'bluedart': { name: 'Bluedart', slabSize: 0.5, base: 130, add: 130, eta: '2-3 days', sortEta: 3 },
  'tirupati': { name: 'Tirupati', slabSize: 1.0, base: 50, add: 50, eta: '4-7 days', sortEta: 7 },
  'dtdc_express': { name: 'DTDC Express (7x)', slabSize: 0.5, base: 120, add: 110, eta: '4-5 days', sortEta: 5 },
  'dtdc_surface': { name: 'DTDC Surface (7d)', slabSize: 0.5, base: 100, add: 85, eta: '4-7 days', sortEta: 7 }
};

const weightDatabase = {
  "a4": { weightKg: 0.13, l: 0, b: 0, h: 0 },
  "a3": { weightKg: 0.13, l: 33, b: 26, h: 2 },
  "a2": { weightKg: 0.2, l: 66, b: 4, h: 4 },
  "1m": { weightKg: 0.2, l: 66, b: 5, h: 5 },
  "2m": { weightKg: 0.25, l: 66, b: 6, h: 6 },
  "3m": { weightKg: 0.45, l: 66, b: 6, h: 6 },
  "4m": { weightKg: 0.55, l: 66, b: 7, h: 7 },
  "5m": { weightKg: 0.65, l: 66, b: 7, h: 7 },
  "6m": { weightKg: 0.7, l: 66, b: 7, h: 7 },
  "7m": { weightKg: 0.7, l: 66, b: 7, h: 7 },
  "8m": { weightKg: 0.7, l: 66, b: 7, h: 7 },
  "9m": { weightKg: 0.75, l: 66, b: 7, h: 7 },
  "10m": { weightKg: 0.8, l: 66, b: 7, h: 7 },
  "11m": { weightKg: 0.9, l: 66, b: 7, h: 7 },
  "12m": { weightKg: 1.11, l: 66, b: 8, h: 8 },
  "13m": { weightKg: 1.45, l: 66, b: 8, h: 8 },
  "14m": { weightKg: 1.55, l: 66, b: 8, h: 8 },
  "15m": { weightKg: 1.5, l: 66, b: 8, h: 8 },
  "16m": { weightKg: 1.75, l: 66, b: 8, h: 8 },
  "17m": { weightKg: 1.85, l: 66, b: 9, h: 9 },
  "18m": { weightKg: 1.95, l: 66, b: 9, h: 9 },
  "19m": { weightKg: 2.05, l: 66, b: 9, h: 9 },
  "20m": { weightKg: 2.15, l: 66, b: 9, h: 9 },
  "21m": { weightKg: 2.25, l: 66, b: 9, h: 9 },
  "22m": { weightKg: 2.35, l: 66, b: 10, h: 10 },
  "23m": { weightKg: 2.45, l: 66, b: 10, h: 10 },
  "24m": { weightKg: 2.55, l: 66, b: 10, h: 10 },
  "25m": { weightKg: 2.65, l: 66, b: 10, h: 10 },
  "26m": { weightKg: 2.75, l: 66, b: 10, h: 10 },
  "27m": { weightKg: 2.85, l: 66, b: 11, h: 11 },
  "28m": { weightKg: 2.95, l: 66, b: 0, h: 0 },
  "29m": { weightKg: 3.05, l: 66, b: 0, h: 0 },
  "30m": { weightKg: 3.15, l: 66, b: 0, h: 0 },
  "31m": { weightKg: 3.25, l: 66, b: 0, h: 0 },
  "32m": { weightKg: 3.35, l: 66, b: 0, h: 0 },
  "33m": { weightKg: 3.45, l: 66, b: 0, h: 0 },
  "34m": { weightKg: 3.55, l: 66, b: 0, h: 0 },
  "35m": { weightKg: 3.65, l: 66, b: 0, h: 0 },
  "36m": { weightKg: 3.75, l: 66, b: 0, h: 0 },
  "37m": { weightKg: 3.85, l: 66, b: 0, h: 0 },
  "38m": { weightKg: 3.95, l: 66, b: 11, h: 11 },
  "39m": { weightKg: 4.05, l: 66, b: 0, h: 0 },
  "40m": { weightKg: 4.15, l: 66, b: 0, h: 0 },
  "41m": { weightKg: 4.25, l: 66, b: 0, h: 0 },
  "42m": { weightKg: 4.35, l: 66, b: 0, h: 0 },
  "43m": { weightKg: 4.45, l: 66, b: 0, h: 0 },
  "44m": { weightKg: 4.55, l: 66, b: 0, h: 0 },
  "45m": { weightKg: 4.65, l: 66, b: 0, h: 0 },
  "46m": { weightKg: 4.75, l: 66, b: 0, h: 0 },
  "47m": { weightKg: 4.85, l: 66, b: 0, h: 0 },
  "48m": { weightKg: 4.95, l: 66, b: 0, h: 0 },
  "49m": { weightKg: 5.05, l: 66, b: 0, h: 0 },
  "50m": { weightKg: 5.15, l: 66, b: 0, h: 0 },
  "51m": { weightKg: 5.25, l: 66, b: 0, h: 0 },
  "52m": { weightKg: 5.35, l: 66, b: 0, h: 0 },
  "53m": { weightKg: 5.45, l: 66, b: 0, h: 0 },
  "54m": { weightKg: 5.55, l: 66, b: 0, h: 0 },
  "55m": { weightKg: 5.65, l: 66, b: 0, h: 0 },
  "56m": { weightKg: 5.75, l: 66, b: 0, h: 0 },
  "57m": { weightKg: 5.85, l: 66, b: 0, h: 0 },
  "58m": { weightKg: 5.95, l: 66, b: 0, h: 0 },
  "59m": { weightKg: 6.05, l: 66, b: 0, h: 0 },
  "60m": { weightKg: 6.15, l: 66, b: 0, h: 0 },
  "61m": { weightKg: 6.25, l: 66, b: 0, h: 0 },
  "62m": { weightKg: 6.35, l: 66, b: 0, h: 0 },
  "63m": { weightKg: 6.45, l: 66, b: 0, h: 0 },
  "64m": { weightKg: 6.55, l: 66, b: 0, h: 0 },
  "65m": { weightKg: 6.65, l: 66, b: 0, h: 0 },
  "66m": { weightKg: 6.75, l: 66, b: 0, h: 0 },
  "67m": { weightKg: 6.85, l: 66, b: 0, h: 0 },
  "68m": { weightKg: 6.95, l: 66, b: 0, h: 0 },
  "69m": { weightKg: 7.05, l: 66, b: 0, h: 0 },
  "70m": { weightKg: 7.15, l: 66, b: 0, h: 0 },
  "71m": { weightKg: 7.25, l: 66, b: 0, h: 0 },
  "72m": { weightKg: 7.35, l: 66, b: 0, h: 0 },
  "73m": { weightKg: 7.45, l: 66, b: 0, h: 0 },
  "74m": { weightKg: 7.55, l: 66, b: 0, h: 0 },
  "75m": { weightKg: 7.65, l: 66, b: 0, h: 0 },
  "76m": { weightKg: 7.75, l: 66, b: 0, h: 0 },
  "77m": { weightKg: 7.85, l: 66, b: 0, h: 0 },
  "78m": { weightKg: 7.95, l: 66, b: 0, h: 0 },
  "79m": { weightKg: 8.05, l: 66, b: 0, h: 0 },
  "80m": { weightKg: 8.15, l: 66, b: 0, h: 0 },
  "81m": { weightKg: 8.25, l: 66, b: 0, h: 0 },
  "82m": { weightKg: 8.35, l: 66, b: 0, h: 0 },
  "83m": { weightKg: 8.45, l: 66, b: 0, h: 0 },
  "84m": { weightKg: 8.55, l: 66, b: 0, h: 0 },
  "85m": { weightKg: 8.65, l: 66, b: 19, h: 15 },
  "86m": { weightKg: 8.75, l: 66, b: 0, h: 0 },
  "87m": { weightKg: 8.85, l: 66, b: 0, h: 0 },
  "88m": { weightKg: 8.95, l: 66, b: 0, h: 0 },
  "89m": { weightKg: 9.05, l: 66, b: 0, h: 0 },
  "90m": { weightKg: 9.15, l: 66, b: 0, h: 0 },
  "91m": { weightKg: 9.25, l: 66, b: 0, h: 0 },
  "92m": { weightKg: 9.35, l: 66, b: 0, h: 0 },
  "93m": { weightKg: 9.45, l: 66, b: 0, h: 0 },
  "94m": { weightKg: 9.55, l: 66, b: 0, h: 0 },
  "95m": { weightKg: 9.65, l: 66, b: 0, h: 0 },
  "96m": { weightKg: 9.75, l: 66, b: 0, h: 0 },
  "97m": { weightKg: 9.85, l: 66, b: 0, h: 0 },
  "98m": { weightKg: 9.95, l: 66, b: 0, h: 0 },
  "99m": { weightKg: 10.05, l: 66, b: 0, h: 0 },
  "100m": { weightKg: 7.5, l: 66, b: 16, h: 16 },
  "101m": { weightKg: 10.25, l: 66, b: 0, h: 0 },
  "102m": { weightKg: 10.35, l: 66, b: 0, h: 0 }
};

export default function App() {
  // ==========================================
  // 2. STATE MANAGEMENT
  // ==========================================
  
  // Inputs
  const [printFormat, setPrintFormat] = useState('Meters');
  const [lengthInput, setLengthInput] = useState('');
  const [sheetQuantity, setSheetQuantity] = useState(1);
  
  // Delivery Preferences
  const [deliveryMethod, setDeliveryMethod] = useState('courier');
  const [courier, setCourier] = useState('bluedart');
  const [courierFilter, setCourierFilter] = useState('all');
  
  // Pincode Status
  const [pincode, setPincode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [serviceableCouriers, setServiceableCouriers] = useState(null);

  // UI State
  const [copied, setCopied] = useState(false);

  // ==========================================
  // 3. CALCULATION ENGINE (Memoized for performance)
  // ==========================================
  const results = useMemo(() => {
    let w, l;
    let isSheet = false;
    let sheetRate = 0;

    // 3.1: Dimensions & Format Parsing
    if (printFormat === 'A4') {
      w = 11; l = 8; isSheet = true; sheetRate = 70;
    } else if (printFormat === 'A3') {
      w = 11; l = 16; isSheet = true; sheetRate = 120;
    } else if (printFormat === 'A2') {
      w = 22.5; l = 16.5; isSheet = true; sheetRate = 250;
    } else {
      if (!lengthInput || lengthInput.trim() === '') return null;
      w = 24; 
      
      let expr = lengthInput.replace(/x/gi, '*');
      
      // Automatically convert "5m" or "5 meters" to inches (1m = 39")
      expr = expr.replace(/([0-9.]+)\s*(meters?|m)\b/gi, '($1*39)');
      
      const cleanInput = expr.replace(/[^0-9+\-*/.()]/g, '');
      try {
        // eslint-disable-next-line no-new-func
        const evaluatedLength = cleanInput ? new Function(`return ${cleanInput}`)() : 0;
        l = Math.ceil(evaluatedLength); // Round up to nearest whole number
      } catch (e) {
        l = 0;
      }

      if (l <= 0 || isNaN(l)) return null;
    }

    // 3.2: Print Cost Calculation
    const qty = isSheet ? Math.max(1, parseInt(sheetQuantity) || 1) : 1;
    let method = '';
    let rateApplied = 0;
    let printCostRaw = 0;
    let costBreakdown = '';
    let totalMeters = 0;
    let totalSqInches = w * l * (isSheet ? qty : 1);

    if (isSheet) {
      method = 'Fixed Sheet Pricing';
      rateApplied = sheetRate;
      printCostRaw = sheetRate * qty;
      costBreakdown = `${qty} pc(s) × ₹${sheetRate} / pc`;
    } else {
      totalMeters = l / 39; // 1 meter = 39 inches
      if (totalMeters < 1) {
        method = 'Square Inch Pricing';
        rateApplied = SQ_INCH_RATE;
        printCostRaw = totalSqInches * rateApplied;
        costBreakdown = `${totalSqInches.toFixed(2)} sq in × ₹${rateApplied} / sq in`;
      } else {
        method = 'Running Meter';
        const applicableSlab = PRICING_SLABS.find(slab => totalMeters <= slab.max);
        rateApplied = applicableSlab.price;
        printCostRaw = totalMeters * rateApplied;
        costBreakdown = `${totalMeters.toFixed(2)} meters × ₹${rateApplied} / m`;
      }
    }

    const finalPrintCost = Math.ceil(printCostRaw);
    const effectiveSqInchRate = printCostRaw / totalSqInches;

    // 3.3: Shipping & Packaging Logic
    const currentPkgCost = deliveryMethod === 'courier' ? PACKAGING_COST : 0;
    const variantId = isSheet ? printFormat.toLowerCase() : `${Math.max(1, Math.ceil(totalMeters))}m`;
    
    // Extrapolate weight if over max DB limit
    const variantData = weightDatabase[variantId] || { weightKg: Math.ceil(totalMeters) * 0.1, l: 66, b: 16, h: 16 };

    const actualWeightKg = variantData.weightKg * qty;
    const volWeightKg = ((variantData.l * variantData.b * variantData.h) / 5000) * qty;
    const countedWeightKg = Math.max(actualWeightKg, volWeightKg);

    // Filter available partners
    const partnersList = serviceableCouriers 
      ? serviceableCouriers.map(id => ({ id, ...shippingPartners[id] }))
      : Object.entries(shippingPartners).map(([id, p]) => ({ id, ...p }));

    // Calculate rates for UI cards
    const availableCouriersArray = partnersList.map((p) => {
      const slabsCount = Math.ceil(countedWeightKg / p.slabSize) || 1;
      const cost = p.base + ((slabsCount - 1) * p.add);
      return { id: p.id, name: p.name, cost, slabsCount, eta: p.eta, sortEta: p.sortEta };
    });

    let shippingCost = 0;
    let shippingSlabsCount = 0;
    let partnerName = 'None';
    let partnerEta = null;

    if (deliveryMethod === 'courier' && courier) {
      const selectedCostObj = availableCouriersArray.find(c => c.id === courier) || availableCouriersArray[0];
      if (selectedCostObj) {
        shippingCost = selectedCostObj.cost;
        shippingSlabsCount = selectedCostObj.slabsCount;
        partnerName = selectedCostObj.name;
        partnerEta = selectedCostObj.eta;
      }
    } else if (deliveryMethod === 'pickup') {
      partnerName = 'Office Pickup';
    }

    return {
      isSheet,
      totalMeters,
      totalSqInches,
      method,
      rateApplied,
      printCost: finalPrintCost,
      effectiveSqInchRate,
      costBreakdown,
      countedWeightKg,
      shippingCost,
      shippingSlabsCount,
      packagingCost: currentPkgCost,
      finalTotal: finalPrintCost + shippingCost + currentPkgCost,
      partnerName,
      eta: partnerEta,
      availableCouriers: availableCouriersArray,
      deliveryMethod,
      w, l, printFormat,
      sheetQuantity: qty
    };
  }, [printFormat, lengthInput, sheetQuantity, courier, deliveryMethod, serviceableCouriers]);

  // ==========================================
  // 4. ACTION HANDLERS
  // ==========================================
  
  // Handler for pincode input changes
  const handlePincodeChange = (e) => {
    setPincode(e.target.value);
    setPincodeStatus(null);
    setPincodeMessage('');
    setServiceableCouriers(null); 
  };

  // Simulated AI Agent Pincode Check (Checks all at once)
  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus('error');
      setPincodeMessage('Please enter a valid 6-digit numeric pincode.');
      return;
    }

    setIsCheckingPincode(true);
    setPincodeStatus(null);
    setPincodeMessage('');

    // Mock API Call Simulation
    setTimeout(() => {
      const available = [];
      const p0 = pincode[0];

      // Tirupati Mock Logic
      if (['1', '3', '4', '7', '8'].includes(p0)) available.push('tirupati');
      
      // Bluedart Mock Logic (Includes a mock blacklist for your testing, like 142029)
      const bluedartBlacklist = ['142029', '000000'];
      if (['1', '2', '3', '4', '5', '7', '8'].includes(p0) && !bluedartBlacklist.includes(pincode)) {
        available.push('bluedart');
      }

      // DTDC Mock Logic
      if (p0 !== '9') {
        available.push('dtdc_express');
        available.push('dtdc_surface');
      }

      setServiceableCouriers(available);
      
      if (available.length > 0) {
        setPincodeStatus('success');
        setPincodeMessage(`✅ Found ${available.length} shipping options for ${pincode}.`);
        if (!available.includes(courier)) setCourier(available[0]);
      } else {
        setPincodeStatus('error');
        setPincodeMessage(`❌ No shipping partners serviceable for ${pincode}.`);
        setCourier('');
      }
      
      setIsCheckingPincode(false);
    }, 1500); 
  };

  const generateMessage = () => {
    if (!results) return '';
    
    const sizeString = results.isSheet 
      ? `${results.printFormat} (${results.w}" x ${results.l}")\n📦 Quantity: ${results.sheetQuantity} piece(s)`
      : `${results.w}" x ${results.l}"`;

    const deliveryDetails = results.deliveryMethod === 'pickup'
      ? `🏢 Delivery: Office Pickup`
      : `📦 Packaging: ₹${results.packagingCost}\n🚚 Shipping (${results.partnerName}): ₹${results.shippingCost} (${results.countedWeightKg.toFixed(2)} kg)\n⏳ Est. Delivery: ${results.eta}`;

    const calcDetails = results.deliveryMethod === 'pickup'
      ? `💰 Total Amount: ₹${results.printCost} (Print) = ₹${results.finalTotal}`
      : `💰 Total Amount: ₹${results.printCost} (Print) + ₹${results.packagingCost} (Pkg) + ₹${results.shippingCost} (Ship) = ₹${results.finalTotal}`;

    return `Hello! 🌟 Thank you for reaching out to us.

Here is the quote for your DTF print requirement:
📏 Size: ${sizeString}
🧮 Applied Rate: ₹${results.rateApplied} (${results.method})
${deliveryDetails}

${calcDetails}

To proceed with the order, please make the payment via UPI/Bank Transfer and share the receipt.

Let us know if you have any questions! Have a great day. 😊`;
  };

  const handleCopy = () => {
    const message = generateMessage();
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
    document.body.removeChild(textarea);
  };

  // UI Derived logic for sorting displayed couriers
  let displayedCouriers = results?.availableCouriers || [];
  if (courierFilter === 'cheapest') {
    displayedCouriers = [...displayedCouriers].sort((a, b) => a.cost - b.cost);
  } else if (courierFilter === 'fastest') {
    displayedCouriers = [...displayedCouriers].sort((a, b) => a.sortEta - b.sortEta);
  }

  // ==========================================
  // 5. RENDER (UI)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
          <div className="flex items-center">
            <div className="text-4xl md:text-5xl font-black flex items-center font-sans uppercase tracking-tight">
              <span className="text-slate-900">PRINT</span>
              <span className="bg-gradient-to-br from-[#7000FF] via-[#FF007A] to-[#FF8A00] text-transparent bg-clip-text">X</span>
            </div>
            <span className="text-slate-400 text-sm md:text-base ml-4 md:ml-5 border-l border-slate-300 pl-4 md:pl-5 font-medium tracking-wide uppercase hidden sm:inline-block">
              Pricing Engine
            </span>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <a 
              href="https://wa.me/+917869581020" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
            >
              <MessageCircle size={18} />
              <span className="hidden md:inline">WhatsApp Support</span>
              <span className="md:hidden">Support</span>
            </a>
            <span className="text-xs text-slate-500 font-medium tracking-wide">
              +91 7869581020
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PRINT DETAILS SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 transition-opacity duration-300">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h2 className="font-semibold flex items-center gap-2 text-slate-800">
                  <FileText size={18} className="text-[#f15bb5]"/> 
                  Print Details
                </h2>
              </div>
              <div className="p-5 space-y-5">
                
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Select Format</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A4', 'A3', 'A2', 'Meters'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setPrintFormat(fmt)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          printFormat === fmt 
                            ? 'bg-gradient-to-r from-[#7b2cbf] via-[#f15bb5] to-[#f8961e] text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {printFormat === 'Meters' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Width (Inches)</label>
                      <div className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 cursor-not-allowed">
                        24 (Fixed)
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Length (Inches or Meters)</label>
                      <input 
                        type="text" 
                        value={lengthInput} 
                        onChange={(e) => setLengthInput(e.target.value)}
                        placeholder="e.g. 20+19 or 5m"
                        className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#f15bb5]/50 focus:border-[#f15bb5] outline-none transition-all"
                      />
                      {results && !results.isSheet && (
                        <p className="text-xs text-[#f15bb5] font-medium mt-1">Computed length: {results.l}"</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Selected Format</label>
                      <div className="w-full text-sm bg-pink-50 border border-pink-100 text-pink-800 rounded-lg p-2.5 flex flex-col justify-center">
                        <span className="font-semibold">{printFormat} Sheet</span>
                        <span className="text-[10px] opacity-80 mt-0.5">
                          ({printFormat === 'A4' ? '11" × 8"' : printFormat === 'A3' ? '11" × 16"' : '22.5" × 16.5"'})
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500 uppercase">Quantity (Pieces)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={sheetQuantity} 
                        onChange={(e) => setSheetQuantity(e.target.value)}
                        className="w-full text-sm bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#f15bb5]/50 focus:border-[#f15bb5] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* DELIVERY & SHIPPING SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 transition-opacity duration-300">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h2 className="font-semibold flex items-center gap-2 text-slate-800">
                  <Truck size={18} className="text-[#7000FF]"/> 
                  Delivery Details
                </h2>
              </div>
              <div className="p-5 space-y-4">
                
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase block mb-2">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        deliveryMethod === 'pickup' 
                          ? 'bg-gradient-to-r from-[#7b2cbf] via-[#f15bb5] to-[#f8961e] text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🏢 Office Pickup
                    </button>
                    <button
                      onClick={() => setDeliveryMethod('courier')}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        deliveryMethod === 'courier' 
                          ? 'bg-gradient-to-r from-[#7b2cbf] via-[#f15bb5] to-[#f8961e] text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      🚚 Courier
                    </button>
                  </div>
                </div>

                {deliveryMethod === 'courier' && (
                  <div className="space-y-4 pt-1 border-t border-slate-100 mt-4">
                    
                    {/* PINCODE CHECKER */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 mt-3">
                      <label className="text-xs font-medium text-slate-500 uppercase flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#f8961e]" /> Check Pincode Serviceability
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="Enter 6-digit Pincode"
                          value={pincode}
                          onChange={handlePincodeChange}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#f8961e]/50 focus:border-[#f8961e] outline-none transition-all"
                        />
                        <button
                          onClick={handleCheckPincode}
                          disabled={isCheckingPincode || pincode.length < 6}
                          className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {isCheckingPincode ? <Loader2 size={16} className="animate-spin" /> : 'Check'}
                        </button>
                      </div>
                      {pincodeMessage && (
                        <p className={`text-xs font-medium ${pincodeStatus === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {pincodeMessage}
                        </p>
                      )}
                    </div>

                    {/* DYNAMIC PARTNER SELECTION */}
                    {displayedCouriers.length > 0 ? (
                      <div className="space-y-2 animate-in fade-in duration-300">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-slate-500 uppercase">Available Partners</label>
                            <div className="flex bg-slate-200/60 p-0.5 rounded-lg">
                              {['all', 'fastest', 'cheapest'].map(filter => (
                                <button 
                                  key={filter}
                                  onClick={() => setCourierFilter(filter)} 
                                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${courierFilter === filter ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                  {filter}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {displayedCouriers.map((c) => (
                              <button 
                                key={c.id} 
                                onClick={() => setCourier(c.id)}
                                className={`text-left p-3 rounded-xl border transition-all ${
                                  courier === c.id 
                                    ? 'border-[#7000FF] bg-purple-50 ring-1 ring-[#7000FF] shadow-sm' 
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className={`font-semibold text-sm ${courier === c.id ? 'text-[#7000FF]' : 'text-slate-700'}`}>
                                    {c.name}
                                  </span>
                                  {results && (
                                    <span className={`font-bold text-sm ${courier === c.id ? 'text-[#7000FF]' : 'text-slate-900'}`}>
                                      ₹{c.cost}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  ⏳ {c.eta}
                                </span>
                              </button>
                            ))}
                          </div>
                      </div>
                    ) : (
                      pincodeStatus === 'error' && (
                        <div className="text-sm text-center py-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                          Please provide a different pincode or choose Office Pickup.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* RESULTS OUTPUT SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[16rem] flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-semibold flex items-center gap-2 text-slate-800">
                  <Calculator size={18} className="text-[#7b2cbf]"/> 
                  Decision & Calculation
                </h2>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center">
                {!results ? (
                  <div className="text-center text-slate-400 py-8">
                    <Calculator size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Enter print dimensions to see breakdown</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {results.isSheet ? (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">Total Quantity</p>
                          <p className="text-xl font-semibold text-slate-800">{results.sheetQuantity} pcs</p>
                          <p className="text-xs text-slate-400 mt-1">{results.printFormat} format</p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <p className="text-xs text-slate-500 mb-1">Total Running</p>
                          <p className="text-xl font-semibold text-slate-800">{results.totalMeters.toFixed(3)}m</p>
                          <p className="text-xs text-slate-400 mt-1">@ ₹{results.rateApplied} / m</p>
                        </div>
                      )}
                      
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Print Cost</p>
                        <p className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#7b2cbf] to-[#f15bb5]">₹{results.printCost}</p>
                        <p className="text-xs text-slate-400 mt-1">{results.method}</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <p className="text-xs text-orange-600 mb-1">
                          {results.deliveryMethod === 'pickup' ? 'Delivery' : 'Shipping & Pkg'}
                        </p>
                        <p className="text-xl font-semibold text-orange-600">
                          {results.deliveryMethod === 'pickup' || results.shippingCost === 0 ? 'Free' : `₹${results.shippingCost + results.packagingCost}`}
                        </p>
                        <p className="text-xs text-orange-500 mt-1">
                          {results.deliveryMethod === 'pickup' ? 'Office Pickup' : results.eta ? `ETA: ${results.eta} (${results.countedWeightKg.toFixed(2)} kg)` : 'No courier selected'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <p className="text-sm text-slate-500 mb-1">Cost Breakdown</p>
                          <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded inline-block text-slate-600">
                            Print: {results.costBreakdown}
                          </p>
                          <br />
                          <p className="font-mono text-xs bg-orange-50 px-2 py-1 rounded inline-block text-orange-600">
                            {results.deliveryMethod === 'pickup' 
                              ? 'Delivery: Office Pickup (Free)' 
                              : `Ship: ${results.partnerName} (${results.shippingSlabsCount} slabs) + ₹${results.packagingCost} Pkg`}
                          </p>
                          {!results.isSheet && (
                            <p className="text-[10px] text-slate-400 block pt-1">Effective print rate: ₹{results.effectiveSqInchRate.toFixed(2)} / sq in</p>
                          )}
                        </div>
                        <div className="text-right pb-1">
                          <p className="text-xs text-slate-500 mb-1 font-medium">Final Total</p>
                          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">₹{results.finalTotal}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </section>

            {/* MESSAGE GENERATOR SECTION */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between rounded-t-xl">
                <h2 className="font-semibold flex items-center gap-2 text-slate-800">
                  <MessageCircle size={18} className="text-[#f8961e]"/> 
                  Client Quote Message
                </h2>
                <button 
                  onClick={handleCopy}
                  disabled={!results}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    results 
                      ? copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gradient-to-r from-[#7b2cbf] via-[#f15bb5] to-[#f8961e] text-white hover:opacity-90'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Message'}
                </button>
              </div>
              <div className="p-5">
                <textarea 
                  readOnly
                  value={generateMessage()}
                  className="w-full h-56 resize-none border-0 bg-slate-50 p-4 rounded-lg font-sans text-sm text-slate-700 focus:ring-2 focus:ring-[#f15bb5]/30 outline-none"
                  placeholder="The auto-generated WhatsApp message will appear here once you enter the details..."
                />
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
