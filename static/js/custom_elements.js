class CustomSelect extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.tabIndex = "0"; 
        this.onblur = (BlurEvent) => CloseCustomSelect(this, BlurEvent);
        this.classList.add('CustomSelect');

        let CustomSelectItems=[];
        Array.from(this.children).forEach(CustomSelectItem => {
            var Item = document.createElement('li');
            Item.innerText = CustomSelectItem.innerText;
            Item.classList.add('CustomSelectItem');

            if (CustomSelectItem.hasAttribute("color")){
                Item.style.color = CustomSelectItem.getAttribute('color')
            }

            if (CustomSelectItem.classList[0]!="select_option"){
                Item.classList.add(CustomSelectItem.classList[0]);
            }
            Item.onclick = function(ClickEvent) {SetCustomSelectItem(this);}
            CustomSelectItems.push(Item);
        })

        let SelectedValues="";
        if (this.classList[0]=="AddMultiplyParametrValueCustomSelect"){
            SelectedValues = `
                    <div class="SelectedValues"></div>
            `;
        }
        this.innerHTML = `
            <div class="SelectInput" tabindex="0" onclick="this.parentElement.classList.toggle('active');this.parentElement.querySelector('.SelectMenu .SelectSearchInput').focus();">
                <input type="hidden" class="SelectedValue" name="${this.getAttribute('selected_value_name')}" value="" requird>
                <span class="SelectName">${this.getAttribute('select_title')}</span>${SelectedValues}
                <svg class="CustomOpenSelectIcon" xmlns="http://www.w3.org/2000/svg"  width="16"  height="16"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>
            </div>
            <div class="SelectMenu">
                <input type="text" class="SelectSearchInput" placeholder="Search" onblur="BlurCustomSelectSearch(this, event)" onkeyup="SearchCustomSelect(this);">
                <ul class="SelectItems">
                </ul>
            </div>
        `;

        var SelectValueContainer=this.querySelector(".SelectMenu .SelectItems")
        CustomSelectItems.forEach(function(Item) {
            SelectValueContainer.appendChild(Item);
        });        
    }
}

function SetCustomSelectItem(CustomSelectItem){
    var CustomSelectElement=CustomSelectItem.parentElement.parentElement.parentElement
    CustomSelectElement.classList.remove("active");

    if (CustomSelectElement.classList[0]=="AddMultiplyParametrValueCustomSelect"){
        if (!CustomSelectElement.querySelector('.SelectInput .SelectedValue').value.includes(CustomSelectItem.innerText)){
            CustomSelectElement.querySelector('.SelectInput .SelectName').style.display="none"
            CustomSelectElement.querySelector('.SelectInput .SelectedValues').innerHTML += `
                <div class="SelectedValueItem">
                    <p class="SelectedValueItemText">${CustomSelectItem.innerText}</p>
                    <img onclick="DeleteCustomSelectItem(this.parentElement, event);" class="SelectedValueItemDelete" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='256' height='256' viewBox='0 0 256 256' xml:space='preserve'%3E%3Cdefs%3E%3C/defs%3E%3Cg style='stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;' transform='translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)'%3E%3Crect x='-10.67' y='37.03' rx='0' ry='0' width='111.33' height='15.95' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255, 255, 255); fill-rule: nonzero; opacity: 1;' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -18.6396 44.9973)'/%3E%3Crect x='37.03' y='-10.67' rx='0' ry='0' width='15.95' height='111.33' style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(255, 255, 255); fill-rule: nonzero; opacity: 1;' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -18.6396 44.9996)'/%3E%3C/g%3E%3C/svg%3E" tabindex="0">
                </div>
            `

            CustomSelectElement.querySelector('.SelectInput .SelectedValue').value += '||'+ CustomSelectItem.innerText;
        }
    }
    else {
        CustomSelectElement.querySelector('.SelectInput .SelectName').innerText = CustomSelectItem.innerText;
        CustomSelectElement.querySelector('.SelectInput .SelectName').style.color = CustomSelectItem.style.color;
        
        CustomSelectElement.querySelector('.SelectInput .SelectedValue').value = CustomSelectItem.innerText;
    }

    if (["AddParametrNameCustomSelect", "IfParametrNameCustomSelect"].includes(CustomSelectElement.classList[0])){
        AddValue(CustomSelectItem);
    }

    if (["IfStatementParametrNameCustomSelect"].includes(CustomSelectElement.classList[0])){
        AddStatement(CustomSelectItem);
    }

    if (["IfStatementNameCustomSelect"].includes(CustomSelectElement.classList[0])){
        AddStatementValue(CustomSelectItem);
    }

    let SelectedElementsInfo = Array.from(document.querySelectorAll(".selected_option"))

    if (CustomSelectElement.classList[0]=="AddParametrCustomSelect" && !CustomSelectItem.classList.contains("selected_option") || CustomSelectElement.classList[0]=="AddParametrCustomSelect" && SelectedElementsInfo.indexOf(CustomSelectItem)+1==SelectedElementsInfo.length){
        let UsedParametrs = Array.from(document.querySelectorAll(".AddParametrCustomSelect .SelectedValue")).filter(SelectedValue => !["Picture (optional)"].includes(SelectedValue.value)).map(SelectedValue => SelectedValue.value);
    
        let ParametrNames = `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)">None</li>`;
        RequiredParametrsNames.forEach(ParametrName => {if (!UsedParametrs.includes(ParametrName)) {ParametrNames += `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)" style="color:#a34343">${ParametrName}</li>`;}});
        OptionalPareametrsNames.forEach(ParametrName => {if (!UsedParametrs.includes(ParametrName)) {ParametrNames += `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)" style="color:#9ba343">${ParametrName}</li>`;}});
        CategoryParametrNames.forEach(ParametrName => {if (!UsedParametrs.includes(ParametrName)) {ParametrNames += `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)">${ParametrName}</li>`;}});
        
        document.querySelectorAll(".AddParametrCustomSelect .SelectMenu .SelectItems").forEach(SelectItems => {SelectItems.innerHTML = ParametrNames})
    }
    
}

function DeleteCustomSelectItem(CustomSelectItem, DeleteEvent){
    var SelectedValue = CustomSelectItem.parentElement.parentElement.parentElement.querySelector('.SelectInput .SelectedValue')
    let DeleteItemValueIndex = Array.from(CustomSelectItem.parentElement.parentElement.children).indexOf(CustomSelectItem.parentElement);
    let ValuesArray = SelectedValue.value.split('||')
    ValuesArray.splice(DeleteItemValueIndex-1, 1)
    ValuesArray = ValuesArray.join("||")
    SelectedValue.value = ValuesArray;

    if (SelectedValue.value == ''){
        SelectedValue.parentElement.querySelector('.SelectName').style.display = 'block';
    }

    CustomSelectItem.remove();
    DeleteEvent.stopPropagation();
}

function SearchCustomSelect(SearchInput){
    SearchInput.parentElement.parentElement.querySelectorAll('.SelectItems li').forEach(CustomSelectItem =>{
        if (CustomSelectItem.innerHTML.toLowerCase().indexOf(SearchInput.value.toLowerCase()) > -1){
            CustomSelectItem.style.display = '';
        }
        else{
            CustomSelectItem.style.display = 'none';
        }
    })
}

function CloseCustomSelect(CustomSelect, BlurEvent){
    if (!CustomSelect.contains(BlurEvent.relatedTarget)){
        CustomSelect.classList.remove("active");
    }
}

function BlurCustomSelectSearch(CustomSelectSearch, BlurEvent){
    var CustomSelect = CustomSelectSearch.parentElement.parentElement
    if (!CustomSelect.contains(BlurEvent.relatedTarget)){
        CustomSelect.focus();
        CustomSelect.blur();
    }
}

customElements.define('custom-select', CustomSelect);


class CustomCheckbox extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.innerHTML = `
            <label class="CustomCheckboxInput">
                <input type="hidden" class="SelectedValue" name="${this.getAttribute('selected_value_name')}" value="false">
                <input type="checkbox" class="CustomCheckbox" onclick="this.parentElement.querySelector('.SelectedValue').value=this.checked" name="CustomCheckbox">
                <span class="CustomCheckboxMark"></span>
            </label>
        `  
    }
}

customElements.define('custom-checkbox', CustomCheckbox);


class CustomInputNumber extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.innerHTML = `
            <label class="CustomNumberInput">
                <input type="number" class="CustomInput" placeholder="${this.getAttribute('select_title')}" step="${this.getAttribute('input_step')}" name="${this.getAttribute('selected_value_name')}" required">
                <button type="button" class="CustomMinusButton" onclick="ChangeInputValue(this.parentElement, '-')">-</button>
                <button type="button" class="CustomPlusButton" onclick="ChangeInputValue(this.parentElement, '+')">+</button>
            </label>
        `  
    }
}

function ChangeInputValue(CustomInput, Mark) {
    CustomInput = CustomInput.querySelector(".CustomInput")
    let CustomInputNumber = Math.round(CustomInput.value * 10) / 10;
    if (Mark=="+") {
        CustomInputNumber+=1;
    }
    else {
        CustomInputNumber-=1;
    }

    if (CustomInputNumber<0){
        CustomInputNumber=0;
    }
    CustomInput.value = CustomInputNumber
}

customElements.define('custom-input-number', CustomInputNumber);


class CustomInputText extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.innerHTML = `
            <label class="CustomTextInput">
                <input type="text" class="CustomInput" placeholder="${this.getAttribute('select_title')}" name="${this.getAttribute('selected_value_name')}" required">
            </label>
        `  
    }
}

customElements.define('custom-input-text', CustomInputText);


class CustomPrompt extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.classList.add('CustomPromptContainer');
        this.innerHTML = `
            <div class="CustomPromptShape">
                ${this.getAttribute('prompt')}
            </div>
            <svg class="CustomPromptTail" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-triangle-inverted"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20.118 3h-16.225a2.914 2.914 0 0 0 -2.503 4.371l8.116 13.549a2.917 2.917 0 0 0 4.987 .005l8.11 -13.539a2.914 2.914 0 0 0 -2.486 -4.386z" /></svg>
        `  
    }
}

function OpenCustomPrompt(CustomPrompt){
    CustomPrompt.classList.add("CustomPromptContainerActivate");
    document.onclick = function() {
        CustomPrompt.classList.remove("CustomPromptContainerActivate");
        document.onclick=null;
    };
}


customElements.define('custom-prompt', CustomPrompt);


class CustomPopupPrompt extends HTMLElement {
    constructor() {
        super();
    }
  
    connectedCallback() {
        this.classList.add('CustomPopupPromptOverlay');
        this.onclick=function(){CloseCustomPopupPrompt(event, this)}
        this.innerHTML = `
            <div class="CustomPopupPromptContent">
                <button class="CustomPopupPromptCloseButton" onclick='this.parentElement.parentElement.classList.remove("CustomPopupPromptOverlayActivate");'>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                </button>
                <div class="CustomPopupPromptBody">
                    <h2>${this.getAttribute('prompt_title')}</h2>
                    <p>${this.getAttribute('prompt_text')}</p>
                </div>
            </div>
        `  
    }
}

function OpenCustomPopupPrompt(CustomPopupPromptOverlay){
    CustomPopupPromptOverlay.classList.add("CustomPopupPromptOverlayActivate");
};

function CloseCustomPopupPrompt(CloseCustomPopupPromptEvent, CustomPopupPromptOverlay){
    console.log(CloseCustomPopupPromptEvent.target);
    if (CloseCustomPopupPromptEvent.target == CustomPopupPromptOverlay) {
        CustomPopupPromptOverlay.classList.remove("CustomPopupPromptOverlayActivate");
    }
};


customElements.define('custom-popup-prompt', CustomPopupPrompt);