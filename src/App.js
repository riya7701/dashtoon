import React, { useState } from 'react';
import { useEffect, useRef } from 'react';

import './App.css';

const App = () => {
  const [panelText, setPanelText] = useState(Array(10).fill(''));
  const [comicPanels, setComicPanels] = useState([]);
  const [loading, setLoading] = useState(false);

  const query = async (data) => {
    const response = await fetch(
      "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
      {
        headers: {
          "Accept": "image/png",
          "Authorization": `Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  };

  const parallaxRef = useRef();

  useEffect(() => {
    const parallaxBackground = parallaxRef.current;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      parallaxBackground.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0)`;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const generateComic = async () => {
    try {
      setLoading(true);
      const promises = panelText.map((text, index) => {
        if (text.trim() !== '') {
          // Only make API call if text is not empty or only whitespace
          return query({ inputs: text }).catch((error) => {
            console.error(`Error generating comic for panel ${index + 1}:`, error);
            return null;
          });
        } else {
          // If text is empty, return a resolved Promise with null
          return Promise.resolve(null);
        }
      });
  
      const responses = await Promise.all(promises);
      const urls = responses
        .filter((response) => response !== null)
        .map((response) => URL.createObjectURL(response));
      setComicPanels(urls);
  
      if (urls.length === 0) {
        alert('No non-empty text provided. Please fill in at least one text box.');
      }
    } catch (error) {
      console.error('Error generating comic:', error);
      alert('Failed to generate comic. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <body className="parallax-background" ref={parallaxRef}>
      <div className="parallax-container">
    <div className="App">
      <h1><center>COMIC STRIP GENERATOR</center></h1>
    <div>
      {/* Your Form for Inputting Text */}
      <div className="panel">
        {panelText.map((text, index) => (
          <div key={index} className="panel-container">
            <textarea className="text"
              type="text"
              value={text}
              onChange={(e) => {
                const newText = e.target.value;
                setPanelText((prevText) => {
                  const newTextArray = [...prevText];
                  newTextArray[index] = newText;
                  return newTextArray;
                });
              }}
            />
          </div>
        ))}
      </div>
      </div>

      {/* Button to Generate Comic */}
      <button className="but" onClick={generateComic} disabled={loading}>
       <h3>  GENERATE COMIC </h3>
      </button>

      {/* Display Generated Comic Panels */}
      <div className="comic-display">
        {comicPanels.map((url, index) => (
          <div key={index} className="comic-panel">
          <img src={url} alt={`Comic Panel ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
    </div>
    </body>
    
  );
};

export default App;
