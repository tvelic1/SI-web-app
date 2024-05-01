import React, { useEffect, useState } from "react";
import "../css/records.css";

function Records() {
  const [recordData, setRecordData] = useState([]);
  const [location, setLocation] = useState([]);
  const [campaignName, setCampaignName] = useState("");

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("recordData"));
    if (storedData) {
      setRecordData(storedData);
    }

    const locationName = localStorage.getItem("locationName");
    //console.log(locationName);
    if (locationName !== undefined && locationName !== null) {
      //console.log("oo");
      setLocation(JSON.parse(locationName));
    }

    const campaignName = localStorage.getItem("campaignName");
    if (campaignName !== undefined && campaignName !== null) {
      setCampaignName(campaignName);
    }
  }, []);

  return (
    <div className="container">
      {recordData.length ? (
        <React.Fragment>
          <h2 className="heading">
            Record for Location:{location.typeOfLocation} within Campaign:{" "}
            {campaignName}
          </h2>
          <div className="recordsContainer">
            {recordData.map((record, index) => (
              <div key={index} className="record">
                <div>
                  <p>
                    <strong> Contact Number:</strong> {location.contactNumber}
                  </p>
                  <p>
                    <strong> Description:</strong> {location.description}
                  </p>
                  <p>
                    <strong>Serial Number:</strong> {record.serialNumber}
                  </p>
                  <p>
                    <strong>Inventory Number:</strong> {record.inventoryNumber}
                  </p>
                  <p>
                    <strong>GPS Coordinates:</strong> {record.gpsCoordinates}
                  </p>
                  <p>
                    <strong>Full Address:</strong> {record.fullAddress}
                  </p>
                </div>
                <div>
                  <img src={record.photoUrl}></img>
                </div>
              </div>
            ))}
          </div>
        </React.Fragment>
      ) : (
        <div className="noRecordMessage">
          <h2 style={{ color: "black" }}>
            There is no record for this location
          </h2>
        </div>
      )}
    </div>
  );
}

export default Records;
