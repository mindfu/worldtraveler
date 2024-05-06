// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import styles from './Form.module.css';
import Button from './Button';
import BackButton from './BackButton';
import { useUrlPosition } from '../hooks/useUrlPosition';
import Message from './Message';
import Spinner from './Spinner';
import { useCities } from '../contexts/CitiesContext';
import { useNavigate } from 'react-router-dom';

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  const [mapLat, mapLng] = useUrlPosition();
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  console.log(isLoadingGeocoding);
  console.log(mapLat, mapLng);
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  console.log(country);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState('');
  const [geoCodingError, setGeoCodingError] = useState('');
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

  useEffect(
    () =>
      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true);
          setGeoCodingError('');
          const response = await fetch(
            `${BASE_URL}?latitude=${mapLat}&longitude=${mapLng}`
          );
          const data = await response.json();
          if (!data.countryCode) throw new Error('Click somewhere else');
          setCityName(data.city || data.locality || '');
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (error) {
          setGeoCodingError(error.message);
          console.error(error);
        } finally {
          setIsLoadingGeocoding(false);
        }
      },
    [mapLat, mapLng]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat: mapLat, lng: mapLng },
    };

    await createCity(newCity);
    navigate('/app/cities');
    console.log(newCity);
  }

  if (isLoadingGeocoding) return <Spinner />;

  if (!mapLat && !mapLng) return <Message message="Click on the map" />;

  if (geoCodingError) {
    return <Message message={geoCodingError} />;
  }
  return (
    <form
      className={`${styles.form}${isLoading ? styles.loading : ''}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat="MM/dd/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
