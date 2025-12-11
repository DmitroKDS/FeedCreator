function DeleteParametr(ParametrGap){
    ParametrGap.remove();
}



function CopyParametr(ParametrTr){
    var CopyParametrTr = AddParametr();
    let StatementParametrName = ParametrTr.querySelector(".StatementParametrNameGap .SelectedValue").value
    let StatementName = ParametrTr.querySelector(".StatementNameGap .SelectedValue")
    
    var CopySelectItems = CopyParametrTr.querySelectorAll(".StatementParametrNameGap .SelectMenu .SelectItems .CustomSelectItem");
                
    CopySelectItems.forEach(CopySelectItem => {
        if (CopySelectItem.innerText == StatementParametrName) {
            SetCustomSelectItem(CopySelectItem);
        }
    });

    if (StatementName!=null){
        var CopySelectItems = CopyParametrTr.querySelectorAll(".StatementNameGap .SelectMenu .SelectItems .CustomSelectItem");
                    
        CopySelectItems.forEach(CopySelectItem => {
            if (CopySelectItem.innerText == StatementName.value) {
                SetCustomSelectItem(CopySelectItem);
            }
        });

        if (StatementName.value=="="){
            var StatementValue = ParametrTr.querySelector('.StatementValueGap .SelectedValue')
            if (StatementValue!=null){
                var CopySelectItems = CopyParametrTr.querySelectorAll(".StatementValueGap .SelectMenu .SelectItems .CustomSelectItem");
                            
                CopySelectItems.forEach(CopySelectItem => {
                    if (CopySelectItem.innerText == StatementValue.value) {
                        SetCustomSelectItem(CopySelectItem);
                    }
                });
            }
        }
        else{
            var StatementValue = ParametrTr.querySelector('.StatementValueGap .CustomInput')
            if (StatementValue!=null){
                CopyParametrTr.querySelector(".StatementValueGap .CustomInput").value=StatementValue.value;
            }
        }
    }

    let ParametrName = ParametrTr.querySelector(".ParametrNameGap .SelectedValue").value
    
    if (ParametrName!="") {
        var CopySelectItems = CopyParametrTr.querySelectorAll(".ParametrNameGap .SelectMenu .SelectItems .CustomSelectItem");
                    
        CopySelectItems.forEach(CopySelectItem => {
            if (CopySelectItem.innerText == ParametrName) {
                SetCustomSelectItem(CopySelectItem);
            }
        });

        let ParemetrInfo = params_info[ParametrName];
        var ParametrValueGap=CopyParametrTr.querySelector(".ParametrValueGap");
        if (CheckboxGroup.includes(ParemetrInfo["details"]["type"])){
            var ParametrValue = ParametrTr.querySelector('.ParametrValueGap .CustomCheckbox').checked

            ParametrValueGap.querySelector(".SelectedValue").value=ParametrValue;
            ParametrValueGap.querySelector(".CustomCheckbox").checked=ParametrValue;
        }
        else if (SelectGroup.includes(ParemetrInfo["details"]["type"])){
            var ParametrValue = ParametrTr.querySelector('.ParametrValueGap .SelectedValue').value

            ParametrValueGap.querySelectorAll(".CustomSelectItem").forEach(SelectItem => {
                if (SelectItem.innerText == ParametrValue) {
                    SetCustomSelectItem(SelectItem);
                }
            });
        }
        else if (MultiSelectGroup.concat(MultiSelectSplitGroup).includes(ParemetrInfo["details"]["type"])){
            var ParametrValue = ParametrTr.querySelector('.ParametrValueGap .SelectedValue').value

            ParametrValueGap.querySelectorAll(".CustomSelectItem").forEach(SelectItem => {
                if (ParametrValue.includes(SelectItem.innerText)) {
                    SetCustomSelectItem(SelectItem);
                }
            });
        }
        else if (NumberGroup.concat(TextGroup).includes(ParemetrInfo["details"]["type"])){
            var ParametrValue = ParametrTr.querySelector('.ParametrValueGap .CustomInput').value

            ParametrValueGap.querySelector(".CustomInput").value=ParametrValue;
        }
    }
}





function AddValue(ParametrSelect){
    var ParametrValueGap=ParametrSelect.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.ParametrValueGap')

    if ( params_names.includes(ParametrSelect.innerText) ) {
        let ParemetrInfo = params_info[ParametrSelect.innerText];
        let ParametrType = ParemetrInfo["details"]["type"]
        let ParametrValues = Object.keys(ParemetrInfo["details"]["values"])
        let ParametrUnit = ParemetrInfo["details"]["unit"]
        
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
        else if(ParametrValues.length>0){
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




function AddStatementValue(ParametrSelect){
    var ParametrTr = ParametrSelect.parentElement.parentElement.parentElement.parentElement.parentElement
    var StatementValueGap=ParametrTr.querySelector('.StatementValueGap');

    if (["<", ">"].includes(ParametrSelect.innerText)){
        StatementValueGap.innerHTML = `
            <custom-prompt prompt="Write value" class="CustomPromptContainer StatementValuePrompt"></custom-prompt>
            <custom-input-number select_title="Write statement value" input_step=0.1 selected_value_name="statement_value_input"></custom-input-number>
        `
    }
    else if (ParametrSelect.innerText == "="){
        let StatementParamtrValuesObjects = "";
        statement_param_vals[ParametrTr.querySelector(".StatementParametrNameGap .SelectedValue").value+' (category)'].forEach(StatementParamtrValue => {StatementParamtrValuesObjects += `<custom-select-item class="select_option">${StatementParamtrValue}</custom-select-item>`;});
    
        StatementValueGap.innerHTML = `
            <custom-prompt prompt="Select value" class="CustomPromptContainer StatementValuePrompt"></custom-prompt>
            <custom-select select_title="Select statement value" selected_value_name="statement_value_input" class="IfParametrStatementValueCustomSelect">
                ${StatementParamtrValuesObjects}
            </custom-select>
        `
    }
    else{
        StatementValueGap.innerHTML = `
            <custom-prompt prompt="Write value" class="CustomPromptContainer StatementValuePrompt"></custom-prompt>
            <custom-input-text select_title="Write statement value" selected_value_name="statement_value_input"></custom-input-text>
        `
    }
}


function AddStatement(ParametrSelect){
    var StatementNameGap=ParametrSelect.parentElement.parentElement.parentElement.parentElement.parentElement.querySelector('.StatementNameGap')
    let StatementToAdd=`
            <custom-select-item class="select_option">=</custom-select-item>
            <custom-select-item class="select_option">Contains</custom-select-item>
    `
    if (NumberGroup.includes(params_info[ParametrSelect.innerText][0])){
        StatementToAdd=`
                <custom-select-item class="select_option">></custom-select-item>
                <custom-select-item class="select_option"><</custom-select-item>
                <custom-select-item class="select_option">=</custom-select-item>
                <custom-select-item class="select_option">Contains</custom-select-item>
        `
    }

    StatementNameGap.innerHTML = `
        <custom-prompt prompt="Select statement" class="CustomPromptContainer StatementPrompt"></custom-prompt>
        <custom-select select_title="Select statement" selected_value_name="statement" class="IfStatementNameCustomSelect">
        ${StatementToAdd}
        </custom-select>
    `
}


function AddParametr(){
    var condition_paramsTable=document.getElementsByClassName('if_parametrs_table')[0];

    var ParametrTr = document.createElement("tr");
    ParametrTr.classList.add("parametr");

    let StatementParamtrNamesObjects = "";
    statement_param_names.forEach(StatementParamtrName => {StatementParamtrNamesObjects += `<custom-select-item class="select_option">${StatementParamtrName}</custom-select-item>`;});

    let params_namesObjects = "";
    params_names.forEach(CategoryParametrsName => {params_namesObjects += `<custom-select-item class="select_option">${CategoryParametrsName}</custom-select-item>`;});


    ParametrTr.innerHTML = `
        <th class="IfNameGap">
            If
        </th>
        <th class="StatementParametrNameGap">
            <custom-prompt prompt="Select parametr" class="CustomPromptContainer StatementParametrPrompt"></custom-prompt>
            <custom-select select_title="Select parametr" selected_value_name="statement_parametr" class="IfStatementParametrNameCustomSelect">
                ${StatementParamtrNamesObjects}
            </custom-select>
        </th>
        <th class="StatementNameGap">
        </th>
        <th class="StatementValueGap">
        </th>
        <th class="ParametrNameGap">
            <custom-prompt prompt="Select parametr" class="CustomPromptContainer ParametrPrompt"></custom-prompt>
            <custom-select select_title="Select parametr" selected_value_name="parametr_name" class="IfParametrNameCustomSelect">
                ${params_namesObjects}
            </custom-select>
        </th>
        <th class="ParametrValueGap">
        </th>
        <th class="CopyParametrGap">
            <button class="ParametrCopyButton" type="button" onclick="CopyParametr(this.parentElement.parentElement)"><svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-copy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" /><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" /></svg></button>
        </th>
        <th class="DeleteParametrGap">
            <button class="ParametrDeleteButton" type="button" onclick="DeleteParametr(this.parentElement.parentElement)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M4 7l16 0"></path><path d="M10 11l0 6"></path><path d="M14 11l0 6"></path><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"></path></svg></button>
        </th>
    `;

    condition_paramsTable.appendChild(ParametrTr);

    return ParametrTr;

};


function SubmitFunction(SubmitEvent) {
    let NotSelect=false

    let statement_param_namesObject = document.getElementsByName("statement_parametr");
    
    statement_param_namesObject.forEach(StatementParametrNameObject => {
        if (NotSelect==false && StatementParametrNameObject.value.trim() == ""){
            NotSelect=true;
            StatementParametrNameObject.parentElement.parentElement.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
            OpenCustomPrompt(StatementParametrNameObject.parentElement.parentElement.parentElement.querySelector(".StatementParametrPrompt"));
            SubmitEvent.stopPropagation();
        }
    });

    let StatementParametrs = document.getElementsByName("statement");
    
    StatementParametrs.forEach(StatementParametr => {
        if (NotSelect==false && StatementParametr.value.trim() == ""){
            NotSelect=true;
            StatementParametr.parentElement.parentElement.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
            OpenCustomPrompt(StatementParametr.parentElement.parentElement.parentElement.querySelector(".StatementPrompt"));
            SubmitEvent.stopPropagation();
        }
    });

    let StatementValues = document.getElementsByName("statement_value_input");
    
    StatementValues.forEach(StatementValue => {
        if (NotSelect==false && StatementValue.value.trim() == ""){
            NotSelect=true;
            StatementValue.parentElement.parentElement.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
            OpenCustomPrompt(StatementValue.parentElement.parentElement.parentElement.querySelector(".StatementValuePrompt"));
            SubmitEvent.stopPropagation();
        }
    });

    let ParametrNames = document.getElementsByName("parametr_name");
    
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



    statement_param_namesObject = Object.values(document.getElementsByName("statement_parametr")).map(StatementParametrName => StatementParametrName.value);
    
    StatementParametrs = Object.values(document.getElementsByName("statement")).map(StatementParametr => StatementParametr.value);

    StatementValues = Object.values(document.getElementsByName("statement_value_input")).map(StatementValue => StatementValue.value);

    ParametrNames = Object.values(document.getElementsByName("parametr_name")).map(ParametrName => ParametrName.value);

    ParametrValues = Object.values(document.getElementsByName('value_input')).map(ParametrValue => ParametrValue.value);

    let CheckDublicates = new Set(StatementParametrs.map((StatementParametr, Index) => JSON.stringify([
        StatementParametr, 
        StatementParametrs[Index], 
        StatementValues[Index], 
        ParametrNames[Index], 
        ParametrValues[Index]
    ]))).size != StatementParametrs.length;

    if ( CheckDublicates ) {
        alert('You have dublicates');
        return false;
    }
};