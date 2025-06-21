document.addEventListener('DOMContentLoaded', function() {

    const generateButton = document.getElementById('generate-button');
    const qrCodeOutput = document.getElementById('qr-code-output');
    const appTabs = document.querySelectorAll('.tab-button');
    const appPanels = document.querySelectorAll('.input-panel');
    const usersOnlineSpan = document.getElementById('users-online-count');
    const generatedTodaySpan = document.getElementById('generated-today-count');
    const totalGeneratedSpan = document.getElementById('total-generated-count');
    const helpModal = document.getElementById('help-modal');
    const openModalButton = document.getElementById('open-help-modal');
    const closeModalButton = document.getElementById('close-help-modal');
    const modalTabs = document.querySelectorAll('.modal-tab-button');
    const modalPanels = document.querySelectorAll('.modal-panel');
    const backToTopButton = document.getElementById('back-to-top-btn');

    appTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            appTabs.forEach(t => t.classList.remove('active'));
            appPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.option}`).classList.add('active');
        });
    });
    
    const formatNumber = (num) => num.toLocaleString('en-US');
    let usersOnline = 126, generatedToday = 4812, totalGenerated = 1245917;
    usersOnlineSpan.textContent = formatNumber(usersOnline);
    generatedTodaySpan.textContent = formatNumber(generatedToday);
    totalGeneratedSpan.textContent = formatNumber(totalGenerated);

    setInterval(() => {
        const change = Math.floor(Math.random() * 3) - 1;
        usersOnline += change;
        if (usersOnline < 50) usersOnline = 50;
        usersOnlineSpan.textContent = formatNumber(usersOnline);
        usersOnlineSpan.classList.add('flash');
        setTimeout(() => usersOnlineSpan.classList.remove('flash'), 250);
    }, 3000);

    function incrementGenerationStats() {
        generatedToday++; totalGenerated++;
        generatedTodaySpan.textContent = formatNumber(generatedToday);
        totalGeneratedSpan.textContent = formatNumber(totalGenerated);
        [generatedTodaySpan, totalGeneratedSpan].forEach(span => {
            span.classList.add('flash');
            setTimeout(() => span.classList.remove('flash'), 250);
        });
    }

    function generateQRCode() {
        const activeTab = document.querySelector('.tab-button.active');
        if (!activeTab) return;
        const option = activeTab.dataset.option;
        let qrData = '';
        
        switch (option) {
            case 'url': {
                let urlValue = document.getElementById('url-input').value.trim();
                if(urlValue && !/^https?:\/\//i.test(urlValue)) urlValue = 'https://' + urlValue;
                qrData = urlValue;
                break;
            }
            case 'text': {
                qrData = document.getElementById('text-input').value.trim();
                break;
            }
            case 'email': {
                const to = document.getElementById('email-to').value.trim();
                const subject = document.getElementById('email-subject').value.trim();
                const body = document.getElementById('email-body').value.trim();
                if(to) qrData=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                break;
            }
            case 'wifi': {
                const ssid = document.getElementById('wifi-ssid').value.trim();
                const wifiPassword = document.getElementById('wifi-password').value.trim();
                const encryption = document.getElementById('wifi-encryption').value;
                if(ssid) qrData=`WIFI:T:${encryption};S:${ssid};P:${wifiPassword};;`;
                break;
            }
            case 'phone': {
                const phoneNumber = document.getElementById('phone-number').value.trim();
                if(phoneNumber) qrData=`tel:${phoneNumber}`;
                break;
            }
            case 'sms': {
                const smsTo = document.getElementById('sms-to').value.trim();
                const smsBody = document.getElementById('sms-body').value.trim();
                if(smsTo) qrData=`SMSTO:${smsTo}:${encodeURIComponent(smsBody)}`;
                break;
            }
            case 'contact': {
                const name = document.getElementById('contact-name').value.trim(), phone = document.getElementById('contact-phone').value.trim(), email = document.getElementById('contact-email').value.trim(),
                      org = document.getElementById('contact-org').value.trim(), title = document.getElementById('contact-title').value.trim(), website = document.getElementById('contact-website').value.trim();
                if(name||phone||email) { let vcard = `BEGIN:VCARD\nVERSION:3.0\n`; if(name)vcard+=`FN:${name}\n`; if(org)vcard+=`ORG:${org}\n`; if(title)vcard+=`TITLE:${title}\n`; if(phone)vcard+=`TEL;TYPE=CELL:${phone}\n`; if(email)vcard+=`EMAIL:${email}\n`; if(website)vcard+=`URL:${website}\n`; vcard+=`END:VCARD`; qrData=vcard; }
                break;
            }
            case 'pdf': {
                let pdfUrlValue = document.getElementById('pdf-url').value.trim();
                if(pdfUrlValue && !/^https?:\/\//i.test(pdfUrlValue)) pdfUrlValue = 'https://' + pdfUrlValue;
                qrData = pdfUrlValue;
                break;
            }
            case 'app': {
                const iosUrl = document.getElementById('app-ios-url').value.trim();
                const androidUrl = document.getElementById('app-android-url').value.trim();
                if(iosUrl||androidUrl){ let redirectHtml = `<!DOCTYPE html><html><head><title>App Download</title><script>var u=navigator.userAgent||navigator.vendor||window.opera;if(/android/i.test(u))window.location.href="${androidUrl||iosUrl}";else if(/iPad|iPhone|iPod/.test(u)&&!window.MSStream)window.location.href="${iosUrl||androidUrl}";else window.location.href="${androidUrl||iosUrl}"<\/script></head><body>Redirecting...</body></html>`; qrData = `data:text/html;charset=utf-8,${encodeURIComponent(redirectHtml)}`; }
                break;
            }
            case 'multiurl': {
                const urls = Array.from(document.querySelectorAll('.multiurl-input')).map(i=>i.value.trim()).filter(Boolean);
                if(urls.length > 0) { let htmlContent = `<!DOCTYPE html><html><head><title>Links</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:sans-serif;background:#f0f2f5;padding:40px 20px;margin:0;} a{display:block;background:#007BFF;color:white;text-decoration:none;padding:20px;margin:15px auto;border-radius:12px;text-align:center;max-width:300px;font-size:1.1em;box-shadow:0 4px 6px rgba(0,0,0,0.1);}</style></head><body><div>`; urls.forEach(u=>{let d='Link';try{d=new URL(u).hostname.replace('www.','');}catch(e){} htmlContent+=`<a href="${u}" target="_blank">${d}</a>`;}); htmlContent+=`</div></body></html>`; qrData=`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`; }
                break;
            }
        }

        if (!qrData) { alert('Please fill in at least one field to generate a QR Code.'); return; }

        qrCodeOutput.innerHTML = '';
        qrCodeOutput.classList.remove('placeholder', 'loaded');
        
        new QRCode(qrCodeOutput, { text: qrData, width: 350, height: 350, colorDark: '#000000', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
        
        setTimeout(() => qrCodeOutput.classList.add('loaded'), 50);
        incrementGenerationStats();
    }
    generateButton.addEventListener('click', generateQRCode);

    openModalButton.addEventListener('click', () => helpModal.classList.remove('hidden'));
    closeModalButton.addEventListener('click', () => helpModal.classList.add('hidden'));
    helpModal.addEventListener('click', e => { if (e.target === helpModal) helpModal.classList.add('hidden'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) helpModal.classList.add('hidden'); });
    
    document.querySelectorAll('.faq-item').forEach(item => { item.querySelector('.faq-question').addEventListener('click', () => item.classList.toggle('active')); });
    
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modalTabs.forEach(t => t.classList.remove('active'));
            modalPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`modal-panel-${tab.dataset.modalTab}`).classList.add('active');
        });
    });
    
    document.querySelectorAll('.current-year').forEach(span => { span.textContent = new Date().getFullYear(); });

    window.onscroll = () => {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) { backToTopButton.classList.add('visible'); } 
        else { backToTopButton.classList.remove('visible'); }
    };
    backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});