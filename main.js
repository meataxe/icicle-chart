function init () {
  const data = fetchSourceData();
}

function fetchSourceData() {
  fetch("./heirarchy-data.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      return res.json();
    })
    .then((data) => console.log(data))
    .catch((error) => console.error("Unable to fetch data:", error));
}

document.addEventListener("DOMContentLoaded", function(arg) {
    init();
});
