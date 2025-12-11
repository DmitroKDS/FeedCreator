function SubmitFunction(SubmitEvent) {
    let ParametrNames = Object.values(document.getElementsByName("param")).map(ParametrName => ParametrName.value);
    let AddParametrCustomSelectes = Array.from(document.querySelectorAll(".AddParametrCustomSelect"))
    let NotSelect=false

    if ( !ParametrNames.every(ParametrName => ParametrName != "") ) {
        AddParametrCustomSelectes.forEach(AddParametrCustomSelect => {
            if (NotSelect==false && AddParametrCustomSelect.querySelector(".SelectedValue").value.trim() == ""){
                NotSelect=true;
                AddParametrCustomSelect.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
                OpenCustomPrompt(AddParametrCustomSelect.parentElement.querySelector(".OptionPrompt"));
                SubmitEvent.stopPropagation();
            }
        });
        return false;
    }
    else{
        AddParametrCustomSelectes.forEach(AddParametrCustomSelect => {
            var AddParametrCustomSelectValue = AddParametrCustomSelect.querySelector(".SelectedValue").value
            if (NotSelect == false && !(RequiredParametrsNames.includes(AddParametrCustomSelectValue) || OptionalPareametrsNames.includes(AddParametrCustomSelectValue) || CategoryParametrNames.includes(AddParametrCustomSelectValue) || AddParametrCustomSelectValue=="None")){
                NotSelect=true;
                AddParametrCustomSelect.parentElement.scrollIntoView({behavior: 'smooth', block: 'start'});
                OpenCustomPrompt(AddParametrCustomSelect.parentElement.querySelector(".ExistPrompt"));
                SubmitEvent.stopPropagation();
            }
        });

        RequiredParametrsNames.forEach(RequiredParameterName => {
            if (NotSelect==false && !ParametrNames.includes(RequiredParameterName)){
                NotSelect=true;
                var CustomPopupPromptOverlay = document.querySelector(".CustomPopupPromptOverlay")
                CustomPopupPromptOverlay.querySelector(".CustomPopupPromptBody h2").innerText = `${RequiredParameterName.replace("(required)", "")} not selected`;
                CustomPopupPromptOverlay.querySelector(".CustomPopupPromptBody p").innerText = `You did not select the required param - ${RequiredParameterName.replace('(required)', '')}`;
                OpenCustomPopupPrompt(CustomPopupPromptOverlay);
            }
        });

        if (ParametrNames.filter(Element => Element == "Picture (optional)").length>14){
            if (NotSelect==false){
                NotSelect=true;
                var CustomPopupPromptOverlay = document.querySelector(".CustomPopupPromptOverlay")
                CustomPopupPromptOverlay.querySelector(".CustomPopupPromptBody h2").innerText = `Picture (optional) more than 14`;
                CustomPopupPromptOverlay.querySelector(".CustomPopupPromptBody p").innerText = `Picture (optional) cannot be more than 14`;
                OpenCustomPopupPrompt(CustomPopupPromptOverlay);
            }
        }

        if (NotSelect==true) {
            return false;
        }
    }
};