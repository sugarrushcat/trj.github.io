// ======================================================
// ⚙️ CONFIGURAÇÃO DAS WEBHOOKS
// ======================================================
const WEBHOOK_ACOES = "https://discord.com/api/webhooks/1438189798849384560/lote5LpQxF80SDUZ3QdPOj2aHiQ7JtcJWKfTNxErKA0MjhDdQ86vruN74dnNUy0YMowD";
const WEBHOOK_VENDAS = "https://discord.com/api/webhooks/1434731757953093662/gElahX6G0yY6h-DVQx1RQ8wOu6IJGi-k2M20fEVOgNBy-WT3ztobwuPspLB6hLaeAy6z";
const WEBHOOK_SECUNDARIA = "https://discord.com/api/webhooks/1450610317813092427/n9N_MYFuMGdMtT2By1FbjKQ4OEy33le1711v55vpCdyGyFhZiLedJsRH9ImHANX0sQZY"; 
// ======================================================

const app = {
    data: {
        participants: new Set(),
        cart: [],
        
        // --- LISTA DE VENDAS ---
        // 'cost' = Custo UNITÁRIO (Valor da receita / 2)
        products: [ 
            { name: "Fn Five Seven (PT)", min: 53000,  max: 63600,  weight: 1.5,  cost: 10000 },
            { name: "HK P7M10 (Fajuta)",  min: 45000,  max: 55000,  weight: 1.0,  cost: 5000 },
            { name: "Tec-9 (Sub)",        min: 90000,  max: 110000, weight: 1.75, cost: 20000 },
            { name: "Uzi (Sub)",          min: 120000, max: 140000, weight: 1.25, cost: 20000 },
            { name: "Mtar-21 (Sub)",      min: 150000, max: 170000, weight: 5.0,  cost: 25000 },
            { name: "Ak-74 (Fuzil)",      min: 240000, max: 260000, weight: 8.0,  cost: 35000 },
            { name: "G36C (Fuzil)",       min: 260000, max: 280000, weight: 8.0,  cost: 30000 },
            { name: "Ak Compact (Fuzil)", min: 250000, max: 270000, weight: 2.25, cost: 40000 }, 
            { name: "Mossberg 590",       min: 260000, max: 280000, weight: 6.0,  cost: 35000 }
        ],
        
        // --- RECEITAS DE PRODUÇÃO ---
        // 'cost' = Valor da RECEITA COMPLETA (Faz 2 unidades)
        recipes: [
            { name: "Fn Five Seven",   mats: [17, 13, 26, 25], weight: 1.5,  cost: 20000 },
            { name: "HK P7M10",        mats: [17, 13, 26, 25], weight: 1.0,  cost: 10000 },
            { name: "Tec-9",           mats: [34, 26, 33, 25], weight: 1.75, cost: 40000 },
            { name: "Uzi",             mats: [48, 39, 38, 35], weight: 1.25, cost: 40000 },
            { name: "Mtar-21",         mats: [51, 39, 38, 35], weight: 5.0,  cost: 50000 },
            { name: "Ak-74",           mats: [85, 65, 40, 40], weight: 8.0,  cost: 70000 },
            { name: "G36C",            mats: [85, 65, 40, 40], weight: 8.0,  cost: 60000 },
            { name: "Ak Compact",      mats: [85, 70, 50, 40], weight: 2.25, cost: 80000 },
            { name: "Mossberg 590",    mats: [90, 75, 50, 40], weight: 6.0,  cost: 70000 },
        ],
        
        matNames: ["Alumínio", "Cobre", "Materiais", "Projeto"],
        matWeights: [0.01, 0.01, 0.01, 0.01] 
    },

    init: function() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');

        const actionDate = document.getElementById('acao-data');
        const actionTime = document.getElementById('acao-hora');
        if(actionDate) actionDate.value = `${year}-${month}-${day}`;
        if(actionTime) actionTime.value = `${hour}:${minute}`;

        const salesDate = document.getElementById('venda-data');
        const salesTime = document.getElementById('venda-hora');
        if(salesDate) salesDate.value = `${year}-${month}-${day}`;
        if(salesTime) salesTime.value = `${hour}:${minute}`;

        this.renderProductOptions(this.data.products); 
        this.initProductionTable();
    },

    switchTab: function(tabId, event) {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if(event) event.currentTarget.classList.add('active');
    },

    showToast: function(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    copyAdText: function(element) {
        const textToCopy = element.innerText;
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                this.showToast("Anúncio copiado!");
            }).catch(err => {
                this.fallbackCopyText(textToCopy);
            });
        } else {
            this.fallbackCopyText(textToCopy);
        }
    },
    fallbackCopyText: function(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if(successful) this.showToast("Anúncio copiado!");
            else this.showToast("Erro ao copiar", "error");
        } catch (err) {
            this.showToast("Erro grave ao copiar", "error");
        }
        document.body.removeChild(textArea);
    },

    handleEnterParticipant: function(e) { if (e.key === 'Enter') this.addParticipant(); },
    addParticipant: function() {
        const input = document.getElementById('novo-participante');
        const name = input.value.trim();
        if (!name) return this.showToast('Digite um nome', 'error');
        if (this.data.participants.has(name)) return this.showToast('Já adicionado', 'error');
        this.data.participants.add(name);
        this.renderParticipants();
        input.value = "";
        input.focus();
    },
    renderParticipants: function() {
        const container = document.getElementById('lista-participantes');
        container.innerHTML = '';
        this.data.participants.forEach(p => {
            const div = document.createElement('div');
            div.className = 'chip';
            div.innerHTML = `${p} <span onclick="app.removeParticipant('${p}')">&times;</span>`;
            container.appendChild(div);
        });
    },
    removeParticipant: function(name) {
        this.data.participants.delete(name);
        this.renderParticipants();
    },
    
    sendActionWebhook: function() {
        const tipo = document.getElementById('acao-tipo').value;
        const resultado = document.querySelector('input[name="resultado"]:checked')?.value;
        const rawData = document.getElementById('acao-data').value; 
        const hora = document.getElementById('acao-hora').value;
        const motivo = "Ação Blipada";
        const parts = Array.from(this.data.participants).join('\n> • ');

        if(!tipo || !resultado) return this.showToast('Preencha o local e o resultado!', 'error');

        let dataFormatada = rawData;
        if(rawData.includes('-')) {
            const [ano, mes, dia] = rawData.split('-');
            dataFormatada = `${dia}/${mes}/${ano}`;
        }

        const color = resultado === 'Vitória' ? 3066993 : 15158332; 
        
        const payloadMain = {
            username: "TrojanHelper",
            embeds: [{
                title: `⚔️ Registro de Ação: ${tipo}`,
                color: color,
                fields: [
                    { name: "Resultado", value: `**${resultado.toUpperCase()}**`, inline: true },
                    { name: "Motivo", value: motivo, inline: true },
                    { name: "Data/Hora", value: `${dataFormatada} às ${hora}`, inline: false },
                    { name: "Participantes", value: parts ? `> • ${parts}` : "> Ninguém registrado" }
                ],
                footer: { text: "Sistema de Gestão TRJ" }
            }]
        };

        const payloadLog = {
            username: "Trojan Log",
            embeds: [{
                color: color,
                description: `**Ação:** ${tipo}\n**Data:** ${dataFormatada}\n**Hora:** ${hora}\n**Motivo/resumo Ação Blipada:** ${motivo}\n**Resultado:** ${resultado}`
            }]
        };

        this.sendToDiscord(WEBHOOK_ACOES, payloadMain, "Ação registrada!");
        this.sendToDiscord(WEBHOOK_SECUNDARIA, payloadLog, null);
    },

    renderProductOptions: function(productsToRender) {
        const select = document.getElementById('venda-produto');
        select.innerHTML = '<option value="" disabled selected>Selecione o produto...</option>';
        productsToRender.forEach(p => {
            const option = document.createElement('option');
            option.value = p.name;
            option.dataset.min = p.min;
            option.dataset.max = p.max;
            option.dataset.weight = p.weight;
            option.dataset.cost = p.cost; 
            option.textContent = p.name;
            select.appendChild(option);
        });
        select.selectedIndex = 0; 
        this.updatePriceRange(); 
    },
    updatePriceRange: function() {
        document.querySelectorAll('input[name="preco-tipo"]').forEach(el => el.checked = false);
        document.getElementById('venda-preco').value = '';
    },
    setPrice: function(type) {
        const select = document.getElementById('venda-produto');
        const option = select.options[select.selectedIndex];
        if (!option || !option.value) return;
        const price = type === 'min' ? option.dataset.min : option.dataset.max;
        document.getElementById('venda-preco').value = price;
    },
    addToCart: function() {
        const prodSelect = document.getElementById('venda-produto');
        if(prodSelect.selectedIndex === 0) return this.showToast('Selecione um produto', 'error');
        const selectedOption = prodSelect.options[prodSelect.selectedIndex];
        const prodName = selectedOption.text;
        const prodWeight = parseFloat(selectedOption.dataset.weight);
        const prodCost = parseFloat(selectedOption.dataset.cost) || 0; 
        const price = parseFloat(document.getElementById('venda-preco').value) || 0;
        const qtd = parseInt(document.getElementById('venda-qtd').value) || 1;
        if (price === 0) return this.showToast('Selecione Parceria ou Pista', 'error');
        const total = (price * qtd);
        
        this.data.cart.push({ name: prodName, price, qtd, total, weight: prodWeight, cost: prodCost });
        this.renderCart();
        this.showToast('Item adicionado!');
    },
    clearCart: function() {
        this.data.cart = [];
        this.renderCart();
    },
    removeFromCart: function(index) {
        this.data.cart.splice(index, 1);
        this.renderCart();
    },

    renderCart: function() {
        const container = document.getElementById('cart-items');
        const summaryArea = document.getElementById('cart-summary-area');
        const weightArea = document.getElementById('cart-weight-area');
        
        if (this.data.cart.length === 0) {
            container.innerHTML = '<p class="empty-msg">Carrinho vazio</p>';
            summaryArea.innerHTML = ''; 
            weightArea.style.display = 'none';
            return;
        }
        container.innerHTML = '';
        let grandTotal = 0;
        let totalWeight = 0;
        let totalProductionCost = 0;

        this.data.cart.forEach((item, index) => {
            grandTotal += item.total;
            totalWeight += (item.weight * item.qtd);
            totalProductionCost += (item.cost * item.qtd); 

            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-title">${item.name} — ${item.qtd}x</div>
                    <div class="cart-item-price">R$ ${item.total.toLocaleString('pt-BR')}</div>
                    <div class="btn-remove-item" onclick="app.removeFromCart(${index})">X</div>
                </div>
            `;
        });
        
        const vendedorShare = grandTotal * 0.30;
        const faccaoGross = grandTotal * 0.70;
        const faccaoNet = faccaoGross - totalProductionCost; 
        
        summaryArea.innerHTML = `
            <div class="cart-summary-box">
                <div class="summary-total">💸 Total: R$ ${grandTotal.toLocaleString('pt-BR')}</div>
                ${totalProductionCost > 0 ? `<div style="font-size:0.9rem; color:#aaa; margin-bottom:5px;">🔨 Custo Produção: R$ ${totalProductionCost.toLocaleString('pt-BR')}</div>` : ''}
                <div class="summary-seller">💰 Vendedor (30%): R$ ${vendedorShare.toLocaleString('pt-BR')}</div>
                <div class="summary-faction">🔥 Facção (70% - Custo): R$ ${faccaoNet.toLocaleString('pt-BR')}</div>
            </div>
        `;
        weightArea.style.display = 'inline-block';
        weightArea.innerHTML = `⚖️ Peso: ${totalWeight.toFixed(2).replace('.', ',')} kg`;
    },
    
    sendSaleWebhook: function() {
        if (this.data.cart.length === 0) return this.showToast('Carrinho vazio!', 'error');
        const vendedor = document.getElementById('venda-vendedor').value.trim();
        const faccao = document.getElementById('venda-faccao').value.trim();
        if (!vendedor || !faccao) return this.showToast('Preencha Vendedor e Facção!', 'error');
        
        let grandTotal = 0;
        let totalProductionCost = 0;
        let itemsDesc = "";
        let itemsLogStr = ""; 
        
        this.data.cart.forEach(i => {
            grandTotal += i.total;
            totalProductionCost += (i.cost * i.qtd);
            itemsDesc += `• ${i.name} — ${i.qtd}x — R$ ${i.total.toLocaleString('pt-BR')}\n`;
            itemsLogStr += `${i.name} (${i.qtd}x), `;
        });

        itemsLogStr = itemsLogStr.slice(0, -2);

        const vendedorShare = grandTotal * 0.30;
        const faccaoGross = grandTotal * 0.70;
        const faccaoNet = faccaoGross - totalProductionCost;
        
        const rawDate = document.getElementById('venda-data').value;
        const timeStr = document.getElementById('venda-hora').value;
        let dateStr = rawDate;
        if(rawDate.includes('-')) {
            const [ano, mes, dia] = rawDate.split('-');
            dateStr = `${dia}/${mes}/${ano}`;
        }

        const payloadMain = {
            username: "TrojanHelper",
            embeds: [{
                title: "📄 Venda Registrada",
                color: 5644438,
                fields: [
                    { name: "💼 Vendedor", value: vendedor, inline: true },
                    { name: "🏛️ Facção Compradora", value: faccao, inline: true },
                    { name: "📦 Itens", value: itemsDesc, inline: false },
                    { name: "💸 Total Venda", value: `R$ ${grandTotal.toLocaleString('pt-BR')}`, inline: true },
                    { name: "🔨 Custo Produção", value: `R$ ${totalProductionCost.toLocaleString('pt-BR')}`, inline: true },
                    { name: "💰 Vendedor (30%)", value: `R$ ${vendedorShare.toLocaleString('pt-BR')}`, inline: true },
                    { name: "🔥 Facção (Liq.)", value: `**R$ ${faccaoNet.toLocaleString('pt-BR')}**`, inline: false }
                ],
                footer: { text: `Data: ${dateStr} às ${timeStr}` }
            }]
        };

        const payloadLog = {
            username: "Trojan Log",
            embeds: [{
                color: 5644438,
                description: `**Venda:** ${itemsLogStr}\n**Data:** ${dateStr}\n**Hora:** ${timeStr}\n**Família para venda:** ${faccao}`
            }]
        };

        this.sendToDiscord(WEBHOOK_VENDAS, payloadMain, "Venda enviada!");
        this.sendToDiscord(WEBHOOK_SECUNDARIA, payloadLog, null);
    },

    initProductionTable: function() {
        const tbody = document.querySelector('#tabela-producao tbody');
        if(!tbody) return;
        tbody.innerHTML = ''; 
        this.data.recipes.forEach((r, idx) => {
            // Visual Clean na tabela (apenas nome e input)
            tbody.innerHTML += `<tr class="prod-row" data-name="${r.name.toLowerCase()}">
                <td style="font-weight:bold; color:#fff; padding-left: 15px;">${r.name}</td>
                <td style="text-align:center;">
                    <input type="number" min="0" class="prod-input" data-idx="${idx}" oninput="app.calculateProduction()" style="width:100%; text-align: center; border-radius: 4px; padding: 5px;">
                </td>
            </tr>`;
        });
    },

    filterProductionItems: function() {
        const term = document.getElementById('search-producao').value.toLowerCase();
        const rows = document.querySelectorAll('.prod-row');
        rows.forEach(row => {
            const name = row.dataset.name;
            if(name.includes(term)) { row.style.display = ''; } else { row.style.display = 'none'; }
        });
    },

    loadFromCart: function() {
        if (this.data.cart.length === 0) return this.showToast('Carrinho de vendas vazio!', 'error');
        this.resetProduction();
        let loadedCount = 0;
        this.data.cart.forEach(item => {
            const cleanName = item.name.split('(')[0].trim().toLowerCase();
            const recipeIdx = this.data.recipes.findIndex(r => {
                const recipeName = r.name.toLowerCase();
                return recipeName === cleanName || recipeName.includes(cleanName);
            });

            if(recipeIdx > -1) {
                const input = document.querySelector(`.prod-input[data-idx="${recipeIdx}"]`);
                if(input) {
                    const currentVal = parseInt(input.value) || 0;
                    input.value = currentVal + item.qtd;
                    loadedCount++;
                }
            }
        });
        if (loadedCount > 0) {
            this.calculateProduction();
            this.showToast(`${loadedCount} itens carregados!`);
            const details = document.getElementById('detalhes-area');
            if(details) details.scrollIntoView({ behavior: 'smooth' });
        } else {
            this.showToast('Nenhum item compatível encontrado.', 'error');
        }
    },

    calculateProduction: function() {
        const inputs = document.querySelectorAll('.prod-input');
        let totals = new Array(this.data.matNames.length).fill(0);
        let totalMatWeight = 0;
        let totalProdWeight = 0;
        let totalFinanceCost = 0;
        let hasInput = false;
        
        const detailsContainer = document.getElementById('lista-detalhada');
        const detailsArea = document.getElementById('detalhes-area');
        if(detailsContainer) detailsContainer.innerHTML = ''; 

        inputs.forEach(input => {
            const qtd = parseInt(input.value) || 0;
            if(qtd > 0) {
                hasInput = true;
                const recipe = this.data.recipes[input.dataset.idx];
                const craftsNeeded = Math.ceil(qtd / 2); 
                
                const thisFinanceCost = (craftsNeeded * recipe.cost);
                totalFinanceCost += thisFinanceCost;

                const thisProdWeight = (qtd * recipe.weight);
                totalProdWeight += thisProdWeight;
                
                let thisMatWeight = 0;
                let thisMatsString = [];

                recipe.mats.forEach((cost, matIdx) => {
                    const materialQtd = cost * craftsNeeded;
                    totals[matIdx] += materialQtd;
                    const w = materialQtd * this.data.matWeights[matIdx];
                    thisMatWeight += w;
                    totalMatWeight += w;
                    
                    if (materialQtd > 0) {
                        thisMatsString.push(`${this.data.matNames[matIdx]}: ${materialQtd}`);
                    }
                });

                if(detailsContainer) {
                    const card = document.createElement('div');
                    card.className = 'cart-item'; 
                    card.style.background = 'rgba(255, 255, 255, 0.05)';
                    card.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    card.style.borderRadius = '8px';
                    card.style.padding = '15px';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    
                    const cardHeader = `
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
                            <div style="color:var(--primary); font-weight:bold; font-size: 1rem;">${recipe.name}</div>
                            <div style="background: var(--primary); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">x${qtd}</div>
                        </div>
                    `;

                    const matsGrid = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem; color: #ccc; margin-bottom: 15px;">
                            ${thisMatsString.map(m => {
                                const parts = m.split(':');
                                return `<div style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">
                                    <span style="color: #888;">${parts[0]}:</span> <span style="color: #fff; font-weight:bold;">${parts[1]}</span>
                                </div>`
                            }).join('')}
                        </div>
                    `;

                    const cardFooter = `
                        <div style="margin-top: auto; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <div style="color: #aaa;">Peso: <span style="color: #fff;">${thisProdWeight}kg</span></div>
                            <div style="color: var(--success); font-weight: bold;">R$ ${thisFinanceCost.toLocaleString('pt-BR')}</div>
                        </div>
                    `;

                    card.innerHTML = cardHeader + matsGrid + cardFooter;
                    detailsContainer.appendChild(card);
                }
            }
        });

        const resDiv = document.getElementById('resumo-materiais');
        const weightsDiv = document.getElementById('production-weights');
        const matWeightSpan = document.getElementById('weight-materials-val');
        const prodWeightSpan = document.getElementById('weight-product-val');
        const financeSpan = document.getElementById('cost-finance-val');
        
        if(resDiv) resDiv.innerHTML = '';

        if (hasInput) {
            if(weightsDiv) weightsDiv.style.display = 'flex';
            if(detailsArea) detailsArea.style.display = 'block'; 
            if(matWeightSpan) matWeightSpan.innerText = `${totalMatWeight.toFixed(2).replace('.', ',')} kg`;
            if(prodWeightSpan) prodWeightSpan.innerText = `${totalProdWeight.toFixed(2).replace('.', ',')} kg`;
            if(financeSpan) financeSpan.innerText = `R$ ${totalFinanceCost.toLocaleString('pt-BR')}`;
            
            if(resDiv) {
                totals.forEach((total, i) => {
                    if (total > 0) {
                        resDiv.innerHTML += `<div class="mat-tag" style="background:var(--primary); color:white; padding:5px 10px; border-radius:15px; margin:2px; display:inline-block; font-size:0.9rem;">${this.data.matNames[i]}: ${total}</div>`;
                    }
                });
            }
        } else {
            if(weightsDiv) weightsDiv.style.display = 'none';
            if(detailsArea) detailsArea.style.display = 'none'; 
            if(resDiv) resDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">Selecione itens na tabela ou puxe do carrinho para ver os materiais.</span>';
        }
    },

    resetProduction: function() {
        document.querySelectorAll('.prod-input').forEach(i => i.value = '');
        this.calculateProduction();
    },

    sendToDiscord: function(url, payload, successMsg) {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                if(successMsg) this.showToast(successMsg);
                
                if (url === WEBHOOK_ACOES || url === WEBHOOK_VENDAS) {
                    if(payload.embeds && payload.embeds[0].title.includes("Ação")) {
                        document.getElementById('novo-participante').value = '';
                        this.data.participants.clear();
                        this.renderParticipants();
                    } else if (payload.embeds && payload.embeds[0].title.includes("Venda")) {
                        this.clearCart();
                        document.getElementById('venda-vendedor').value = '';
                        document.getElementById('venda-faccao').value = '';
                    }
                }
            } else {
                console.error("Erro Discord:", response);
            }
        })
        .catch(err => {
            console.error(err);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
