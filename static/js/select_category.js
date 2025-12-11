function OpenLoaderParametrs(){
    document.querySelector(".LoaderParametrsContainer").style.display="flex";
};


function SubmitFunction(SubmitEvent){
    let CategoryName = document.getElementsByName("category")[0].value;
    
    if (CategoryName == "") {
        OpenCustomPrompt(document.querySelector(".CustomPromptContainer"));
        SubmitEvent.stopPropagation();
        return false;
    }
    else if (!CategoryList.includes(CategoryName)){
        OpenCustomPopupPrompt(document.querySelector(".CustomPopupPromptOverlay"));
        return false;
    }
    document.querySelector(".LoaderParametrsContainer").style.display="flex";
};