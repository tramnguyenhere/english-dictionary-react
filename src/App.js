import React, { useState, useMemo, useEffect } from 'react';
import Result from './Result';

const synth = window.speechSynthesis;

const App = () => {
  const voices = useMemo(() => synth.getVoices(), []);
  const [voiceSelected, setVoiceSelected] = useState('Google US English');
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState('');
  const [meanings, setMeanings] = useState([]);
  const [phonetics, setPhonetics] = useState([]);
  const [word, setWord] = useState('');
  const [error, setError] = useState('');
  const dictionaryApi = (text) => {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${text}`;
    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setMeanings(result[0].meanings);
        setPhonetics(result[0].phonetics);
        setWord(result[0].word);
        setError('');
      })
      .catch((err) => setError(err));
  };

  const reset = () => {
    setIsSpeaking('');
    setError('');
    setMeanings([]);
    setPhonetics([]);
    setWord('');
  };

  useEffect(() => {
    if (!text.trim()) return reset();
    const debounce = setTimeout(() => {
      dictionaryApi(text);
    }, 1000);
    return () => clearTimeout(debounce);
  }, [text]);

  const startSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((voice) => voice.name === voiceSelected);
    utterance.voice = voice;
    synth.speak(utterance);
  };
  const handleSpeech = () => {
    if (!text.trim()) return reset();
    if (!synth.speaking) {
      startSpeech(text);
      setIsSpeaking('speak');
    } else {
      synth.cancel();
    }

    setInterval(() => {
      if (!synth.speaking) {
        setIsSpeaking('');
      }
    }, 1000);
  };

  return (
    <div className='container'>
      <h1>English Dictionary</h1>

      <form>
        <div className='row'>
          <textarea
            cols='30'
            rows='4'
            placeholder='Enter text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className='voices-icons'>
            <div className='select-voices'>
              <select
                value={voiceSelected}
                onChange={(e) => setVoiceSelected(e.target.value)}
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <i
              className={`fa-solid fa-volume-high ${isSpeaking}`}
              onClick={handleSpeech}
            />
          </div>
        </div>
      </form>

      {text.trim() !== '' && !error && (
        <Result
          word={word}
          meanings={meanings}
          phonetics={phonetics}
          setText={setText}
        />
      )}
    </div>
  );
};

export default App;
