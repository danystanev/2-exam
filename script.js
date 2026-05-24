document.addEventListener("DOMContentLoaded", () => {
    // Inputs
    const revenueInput = document.getElementById("total-revenue");
    const aovInput = document.getElementById("avg-order-value");
    const leadRateInput = document.getElementById("lead-rate");
    const prospectRateInput = document.getElementById("prospect-rate");
    const startInput = document.getElementById("camp-start");
    const endInput = document.getElementById("camp-end");

    // Value Labels
    const leadRateVal = document.getElementById("lead-rate-val");
    const prospectRateVal = document.getElementById("prospect-rate-val");
    const valProspects = document.getElementById("val-prospects");
    const valLeads = document.getElementById("val-leads");
    const valCustomers = document.getElementById("val-customers");
    
    // Chart Container
    const chartContainer = document.getElementById("chart-container");
    const tooltip = document.getElementById("tooltip");

    function calculate() {
        // Parse inputs
        const revenue = parseFloat(revenueInput.value) || 0;
        const aov = parseFloat(aovInput.value) || 1; // prevent divide by zero
        const leadRate = parseFloat(leadRateInput.value) || 0;
        const prospectRate = parseFloat(prospectRateInput.value) || 0;

        // Start and end dates for months calculation
        const startDate = new Date(startInput.value);
        const endDate = new Date(endInput.value);
        
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months -= startDate.getMonth();
        months += endDate.getMonth();
        months = months <= 0 ? 1 : months; // Default to at least 1 month

        // Basic calcs matching the image logic:
        // revenue 10000, AOV 1000 => 10 customers
        // 10 customers / 0.4 lead response rate => 25 leads
        // 25 leads / 0.2 prospect response rate => 125 prospects
        const customers = Math.round(revenue / aov);
        const leads = Math.round(customers / leadRate);
        const prospects = Math.round(leads / prospectRate);

        // Update Text
        leadRateVal.innerText = (leadRate * 100).toFixed(2) + "%";
        prospectRateVal.innerText = (prospectRate * 100).toFixed(2) + "%";
        valCustomers.innerText = customers;
        valLeads.innerText = leads;
        valProspects.innerText = prospects;

        renderChart(months, prospects, leads, customers);
    }

    function renderChart(months, totalProspects, totalLeads, totalCustomers) {
        chartContainer.innerHTML = "";
        
        // Find max value to determine chart scale
        const maxVal = Math.max(totalProspects, 100); 

        // Generate X-Axis labels based on maxVal
        const xAxis = document.createElement('div');
        xAxis.className = 'x-axis';
        for(let i=0; i<=5; i++){
            let tickVal = Math.round((maxVal / 5) * i);
            let tick = document.createElement('span');
            tick.innerText = tickVal + " people";
            xAxis.appendChild(tick);
        }
        chartContainer.appendChild(xAxis);

        for (let i = 1; i <= months; i++) {
            // Assume linear growth for chart representation based on the screenshot
            const tProspects = Math.round((totalProspects / months) * i);
            const tLeads = Math.round((totalLeads / months) * i);
            const tCustomers = Math.round((totalCustomers / months) * i);

            const pWidth = (tProspects / maxVal) * 100;
            const lWidth = (tLeads / maxVal) * 100;
            const cWidth = (tCustomers / maxVal) * 100;

            const row = document.createElement("div");
            row.className = "chart-row";
            
            row.innerHTML = `
                <div class="chart-row-label">${i}</div>
                <div class="chart-bar-group">
                    <div class="bar bar-prospects" style="width: ${pWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                    <div class="bar bar-leads" style="width: ${lWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                    <div class="bar bar-customers" style="width: ${cWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                </div>
            `;
            chartContainer.appendChild(row);
        }

        // Add tooltip listeners
        const bars = document.querySelectorAll(".bar");
        bars.forEach(bar => {
            bar.addEventListener("mouseenter", showTooltip);
            bar.addEventListener("mousemove", moveTooltip);
            bar.addEventListener("mouseleave", hideTooltip);
        });
    }

    function showTooltip(e) {
        const p = e.target.getAttribute("data-p");
        const l = e.target.getAttribute("data-l");
        const c = e.target.getAttribute("data-c");
        const m = e.target.getAttribute("data-month");
        
        tooltip.innerHTML = `Month #${m}<br>Prospects: ${p}<br>Leads: ${l}<br>Customers: ${c}`;
        tooltip.style.opacity = "1";
    }

    function moveTooltip(e) {
        tooltip.style.left = e.pageX + 10 + "px";
        tooltip.style.top = e.pageY + 10 + "px";
    }

    function hideTooltip() {
        tooltip.style.opacity = "0";
    }

    // Attach Event Listeners
    revenueInput.addEventListener("input", calculate);
    aovInput.addEventListener("input", calculate);
    leadRateInput.addEventListener("input", calculate);
    prospectRateInput.addEventListener("input", calculate);
    startInput.addEventListener("change", calculate);
    endInput.addEventListener("change", calculate);

    // Initial render
    calculate();
});