document.addEventListener("DOMContentLoaded", () => {
    // Translations
    const dictionary = {
        en: {
            lang: "Language",
            curr: "Currency",
            start: "Campaign Start",
            end: "Campaign End",
            rev: "Total Revenue",
            aov: "Avg. Order Value",
            months: "Months",
            prospects: '<i class="fas fa-folder"></i> Prospects',
            leads: '<i class="fas fa-user"></i> Leads',
            customers: '<i class="fas fa-trophy"></i> Customers',
            leadRate: "Lead Response Rate",
            prospectRate: "Prospect Response Rate",
            people: "people",
            monthTooltip: "Month",
            prospectsTooltip: "Prospects",
            leadsTooltip: "Leads",
            customersTooltip: "Customers"
        },
        bg: {
            lang: "Език",
            curr: "Валута",
            start: "Начало на кампания",
            end: "Край на кампания",
            rev: "Общи приходи",
            aov: "Средна поръчка",
            months: "Месеци",
            prospects: '<i class="fas fa-folder"></i> Проспекти',
            leads: '<i class="fas fa-user"></i> Лийдове',
            customers: '<i class="fas fa-trophy"></i> Клиенти',
            leadRate: "Отговор на Лийдове",
            prospectRate: "Отговор на Проспекти",
            people: "души",
            monthTooltip: "Месец",
            prospectsTooltip: "Проспекти",
            leadsTooltip: "Лийдове",
            customersTooltip: "Клиенти"
        }
    };
    let currentLang = "en";

    function updateLanguage() {
        const t = dictionary[currentLang];
        document.querySelector('label[for="language"]').innerText = t.lang;
        document.querySelector('label[for="currency"]').innerText = t.curr;
        document.querySelector('label[for="camp-start"]').innerText = t.start;
        document.querySelector('label[for="camp-end"]').innerText = t.end;
        document.querySelector('label[for="total-revenue"]').innerText = t.rev;
        document.querySelector('label[for="avg-order-value"]').innerText = t.aov;
        document.querySelector('.y-axis-label').innerText = t.months;
        document.querySelector('label[for="lead-rate"]').innerText = t.leadRate;
        document.querySelector('label[for="prospect-rate"]').innerText = t.prospectRate;
        
        document.querySelector('.stat-card:nth-child(1) .stat-header div:first-child').innerHTML = t.prospects;
        document.querySelector('.stat-card:nth-child(2) .stat-header div:first-child').innerHTML = t.leads;
        document.querySelector('.stat-card:nth-child(3) .stat-header div:first-child').innerHTML = t.customers;

        // Re-render chart texts 
        calculate();
    }

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
            tick.innerText = tickVal + " " + dictionary[currentLang].people;
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
                    <div class="bar bar-prospects" style="width: 0%" data-width="${pWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                    <div class="bar bar-leads" style="width: 0%" data-width="${lWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                    <div class="bar bar-customers" style="width: 0%" data-width="${cWidth}%" data-month="${i}" data-p="${tProspects}" data-l="${tLeads}" data-c="${tCustomers}"></div>
                </div>
            `;
            chartContainer.appendChild(row);
        }

        // Trigger animations
        setTimeout(() => {
            const bars = document.querySelectorAll(".bar");
            bars.forEach(bar => {
                bar.style.width = bar.getAttribute("data-width");
                bar.addEventListener("mouseenter", showTooltip);
                bar.addEventListener("mousemove", moveTooltip);
                bar.addEventListener("mouseleave", hideTooltip);
            });
        }, 50);
    }

    function showTooltip(e) {
        const p = e.target.getAttribute("data-p");
        const l = e.target.getAttribute("data-l");
        const c = e.target.getAttribute("data-c");
        const m = e.target.getAttribute("data-month");
        const t = dictionary[currentLang];
        
        tooltip.innerHTML = `<strong>${t.monthTooltip} #${m}</strong><br>${t.prospectsTooltip}: ${p}<br>${t.leadsTooltip}: ${l}<br>${t.customersTooltip}: ${c}`;
        tooltip.classList.add("visible");
    }

    function moveTooltip(e) {
        tooltip.style.left = e.pageX + 15 + "px";
        tooltip.style.top = e.pageY + 15 + "px";
    }

    function hideTooltip() {
        tooltip.classList.remove("visible");
    }

    // Language change listener
    const langSelect = document.getElementById("language");
    langSelect.addEventListener("change", (e) => {
        currentLang = e.target.value;
        updateLanguage();
    });

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