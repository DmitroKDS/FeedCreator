function DeleteParametr(ParametrGap){
    ParametrGap.remove();
    
    let UsedParametrs = Array.from(document.querySelectorAll(".ParametrNameGap .AddParametrNameCustomSelect .SelectedValue")).map(SelectedValue => SelectedValue.value);

    let ParametrsNames = "";
    params_names.forEach(ParametrsName => {if (!UsedParametrs.includes(ParametrsName)) {ParametrsNames += `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)">${ParametrsName}</li>`;}});

    Array.from(document.querySelectorAll(".ParametrNameGap .AddParametrNameCustomSelect .SelectMenu .SelectItems")).forEach(SelectItems => {SelectItems.innerHTML = ParametrsNames})
}

function AddValue(ParametrSelect){
    var ParametrValueGap=ParametrSelect.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.ParametrValueGap')

    if ( params_names.includes(ParametrSelect.innerText) ) {
        let ParemetrInfo = params_info[ParametrSelect.innerText];
        let ParametrType = ParemetrInfo["details"]["type"]
        let ParametrValues = Object.keys(ParemetrInfo["details"]["values"])
        let ParametrUnit = ParemetrInfo["details"]["unit"]

        let UsedParametrs = Array.from(document.querySelectorAll(".ParametrNameGap .AddParametrNameCustomSelect .SelectedValue")).map(SelectedValue => SelectedValue.value);

        let ParametrsNames = "";
        params_names.forEach(ParametrsName => {if (!UsedParametrs.includes(ParametrsName)) {ParametrsNames += `<li class="CustomSelectItem" onclick="SetCustomSelectItem(this)">${ParametrsName}</li>`;}});

        Array.from(document.querySelectorAll(".ParametrNameGap .AddParametrNameCustomSelect .SelectMenu .SelectItems")).forEach(SelectItems => {SelectItems.innerHTML = ParametrsNames})

        if (CheckboxGroup.includes(ParametrType)){
            ParametrValueGap.innerHTML = `
                <div class="ParametrValueContainer"><custom-checkbox selected_value_name="value_input"></custom-checkbox></div>
            `
        }
        else if (SelectGroup.includes(ParametrType)){
            let ValueNames = "";
            Array.from(ParametrValues).forEach(ValueName => {ValueNames += `<custom-select-item class="select_option">${ValueName}</custom-select-item>`;});
        
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Select value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-select select_title="Select value" selected_value_name="value_input" class="AddParametrValueCustomSelect">${ValueNames}</custom-select></div>
            `
        }
        else if (MultiSelectGroup.concat(MultiSelectSplitGroup).includes(ParametrType)){
            let ValueNames = "";
            Array.from(ParametrValues).forEach(ValueName => {ValueNames += `<custom-select-item class="select_option">${ValueName}</custom-select-item>`;});
        
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Select value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-select select_title="Select value" selected_value_name="value_input" class="AddMultiplyParametrValueCustomSelect">${ValueNames}</custom-select></div>
            `
        }
        else if ([NumberGroup[1]].includes(ParametrType)){
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Write value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-input-number select_title="Write value" input_step=0.1 selected_value_name="value_input"></custom-input-number></div>
            `
        }
        else if ([NumberGroup[0]].includes(ParametrType)){
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Write value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-input-number select_title="Write value" input_step=1 selected_value_name="value_input"></custom-input-number></div>
            `
        }
        else if (TextGroup.includes(ParametrType)){
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Write value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-input-text select_title="Write value" selected_value_name="value_input"></custom-input-text></div>
            `
        }
        else if(Array.from(ParametrValues).length>0){
            let ValueNames = "";
            Array.from(ParametrValues).forEach(ValueName => {ValueNames += `<custom-select-item class="select_option">${ValueName}</custom-select-item>`;});
        
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Select value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-select select_title="Select value" selected_value_name="value_input" class="AddParametrValueCustomSelect">${ValueNames}</custom-select></div>
            `
        }
        else {
            ParametrValueGap.innerHTML = `
                <custom-prompt prompt="Write value" class="CustomPromptContainer ValuePrompt"></custom-prompt>
                <div class="ParametrValueContainer"><custom-input-text select_title="Write value" selected_value_name="value_input"></custom-input-text></div>
            `
        }

        if (ParametrUnit!=''){
            ParametrValueGap.querySelector(".ParametrValueContainer").innerHTML += `
                <div class="ValueUnit">${ParametrUnit}</div>
            `
        };
    };
};


function AddParametr(){
    var AllParametrsTable=document.getElementsByClassName('all_parametrs_table')[0];

    var ParametrTr = document.createElement("tr");
    ParametrTr.classList.add("parametr");

    let UsedParametrs = Array.from(document.querySelectorAll(".ParametrNameGap .AddParametrNameCustomSelect .SelectedValue")).map(SelectedValue => SelectedValue.value);

    let ParametrsNames = "";
    params_names.forEach(ParametrsName => {if (!UsedParametrs.includes(ParametrsName)) {ParametrsNames += `<custom-select-item class="select_option">${ParametrsName}</custom-select-item>`;}});

    ParametrTr.innerHTML = `
        <th class="ParametrNameGap">
            <custom-prompt prompt="Select parametr" class="CustomPromptContainer ParametrPrompt"></custom-prompt>
            <custom-select select_title="Select parametr" selected_value_name="parametr_name" class="AddParametrNameCustomSelect">
                ${ParametrsNames}
            </custom-select>
        </th>
        <th class="ParametrValueGap">
        </th>
        <th class="DeleteParametrGap">
            <button class="ParametrDeleteButton" type="button" onclick="DeleteParametr(this.parentElement.parentElement)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 7l16 0"></path><path d="M10 11l0 6"></path><path d="M14 11l0 6"></path><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path></svg></button>
        </th>
    `;

    AllParametrsTable.appendChild(ParametrTr);

    return ParametrTr;
};



function SubmitFunction(SubmitEvent) {
    let ParametrNames = document.getElementsByName("parametr_name");
    let NotSelect=false
    
    ParametrNames.forEach(ParametrName => {
        if (NotSelect==false && ParametrName.value.trim() == ""){
            NotSelect=true;
            ParametrName.parentElement.parentElement.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
            OpenCustomPrompt(ParametrName.parentElement.parentElement.parentElement.querySelector(".ParametrPrompt"));
            SubmitEvent.stopPropagation();
        }
    });

    let ParametrValues = document.getElementsByName("value_input");
    
    ParametrValues.forEach(ParametrValue => {
        if (NotSelect==false && ParametrValue.value.trim() == ""){
            NotSelect=true;
            ParametrValue.parentElement.parentElement.parentElement.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
            OpenCustomPrompt(ParametrValue.parentElement.parentElement.parentElement.parentElement.querySelector(".ValuePrompt"));
            SubmitEvent.stopPropagation();
        }
    });

    if (NotSelect==true) {
        return false;
    }
};