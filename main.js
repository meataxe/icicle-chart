function init () {
  const data = fetchSourceData();
  console.log(data);
}

function fetchSourceData() {
  fetch("./heirarchy-data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      return res.json()[0];
    })
    //.then((data) => console.log(data))
    .catch((error) => console.error("Unable to fetch data:", error));
}

document.addEventListener("DOMContentLoaded", function(arg) {
    init();
});
