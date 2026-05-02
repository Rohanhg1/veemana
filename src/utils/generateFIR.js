import { jsPDF } from "jspdf";

export const generateFIR = (transactionDetails) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("National Cybercrime Reporting - ClearLedger", 105, 20, null, null, "center");
    
    // Subtitle
    doc.setFontSize(14);
    doc.text("First Information Report (FIR)", 105, 30, null, null, "center");
    
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Body Text
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    let yPos = 45;
    const lineHeight = 10;
    
    const fields = [
        { label: "Report Date", value: new Date().toLocaleString() },
        { label: "Scheme", value: transactionDetails.scheme || "N/A" },
        { label: "State", value: transactionDetails.state || "N/A" },
        { label: "District", value: transactionDetails.district || "N/A" },
        { label: "Amount (INR)", value: transactionDetails.amount ? `Rs. ${transactionDetails.amount}` : "N/A" },
        { label: "Description", value: transactionDetails.description || "N/A" },
        { label: "AI Suspicion Score", value: transactionDetails.aiScore ? `${transactionDetails.aiScore}/100` : "N/A" },
        { label: "IPFS Hash (Proof)", value: transactionDetails.ipfsHash || "N/A" },
    ];
    
    fields.forEach(field => {
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}:`, 20, yPos);
        
        doc.setFont("helvetica", "normal");
        
        // Handle long descriptions by splitting text
        if (field.label === "Description" && field.value) {
            const splitDescription = doc.splitTextToSize(field.value.toString(), 120);
            doc.text(splitDescription, 70, yPos);
            yPos += (splitDescription.length * 7); // Adjust Y position based on lines
        } else {
            doc.text(field.value ? field.value.toString() : "", 70, yPos);
            yPos += lineHeight;
        }
    });
    
    yPos += 10;
    doc.setFont("helvetica", "italic");
    doc.text("This document is generated automatically by ClearLedger AI Analysis System.", 20, yPos);
    doc.text("It serves as a preliminary report for flagged transactions on the blockchain.", 20, yPos + 7);
    
    // Save the PDF
    doc.save("National_Cybercrime_Reporting_ClearLedger.pdf");
};
