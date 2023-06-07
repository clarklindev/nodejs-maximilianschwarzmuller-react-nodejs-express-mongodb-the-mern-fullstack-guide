import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

import './Map.css';

const Map = (props) => {
  const mapRef = useRef();
  const { center, zoom } = props;

  const [apiKey, setApiKey] = useState();
  let googlemap = useRef();

  useEffect(() => {
    //getapi
    const getApiKey = async () => {
      const response = await fetch('http://localhost:5000/api/admin/key');
      const responseData = await response.json();

      setApiKey(responseData.key);
    };
    getApiKey();
  }, []);

  useEffect(() => {
    async function createMap() {
      if (apiKey) {
        //set up Loader()
        const loader = new Loader({
          apiKey,
          version: 'weekly',
        });

        await loader.load();
        const { Map } = await window.google.maps.importLibrary('maps');
        googlemap.current = new Map(mapRef.current, {
          center,
          zoom,
        });
        new window.google.maps.Marker({
          position: center,
          map: googlemap.current,
        });
      }
    }

    createMap();
  }, [apiKey, center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    />
  );
};

export default Map;
