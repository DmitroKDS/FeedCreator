function SubmitFunction(SubmitEvent) {
    let CustomCompanyInfoInputs = Array.from(document.querySelectorAll(".CustomCompanyInfoInput"));
    let CompanyInfoEmptyError = false;

    CustomCompanyInfoInputs.forEach(CustomCompanyInfoInput => {
        if (!CompanyInfoEmptyError && CustomCompanyInfoInput.querySelector(".CompanyInfoInput").value.trim() == "") {
            OpenCustomPrompt(CustomCompanyInfoInput.querySelector(".PromptFill"));
            SubmitEvent.stopPropagation();
            CompanyInfoEmptyError = true;
        }
        else if (!CompanyInfoEmptyError && CustomCompanyInfoInput.querySelector(".CompanyInfoInput").value.length>255) {
            OpenCustomPrompt(CustomCompanyInfoInput.querySelector(".PromptLenght"));
            SubmitEvent.stopPropagation();
            CompanyInfoEmptyError = true;
        }
    });

    if (CompanyInfoEmptyError) {
        return false;
    }
}