function SubmitFunction(SubmitEvent) {
    let UploadFileInput = document.querySelector(".UploadFileInput");
    
    if (UploadFileInput.value.trim()=="") {
        OpenCustomPrompt(document.querySelector(".CustomPromptContainer"));
        SubmitEvent.stopPropagation();
        return false;
    }
}