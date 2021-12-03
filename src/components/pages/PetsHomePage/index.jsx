import "./styles.css";
import { useEffect, useState, useContext } from 'react';
import {PetItem} from '../../PetItem';
import PetsOrderContext from "../../../context/petsOrderContext";
import { Search } from '../../Search';

import {getAuth, onAuthStateChanged} from "firebase/auth";
import {useHistory} from 'react-router-dom';

export const PetsHomePage = () => {

  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchString, setSearchString] = useState('');


  const globalState = useContext(PetsOrderContext);

  const history = useHistory();

  //check if current user is login
  useEffect(
    ()=> {
      getPets();
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        console.log(user);
        if (!user) {
          history.push('/login');
        }
      })
    }, []
  );

  useEffect(
    ()=> {
     handleSearchByBreed();
    }, [searchString]
  )

  const handleSearchByBreed = () => {
    if (searchString === '') {
      setFilteredPets(pets);
      return;
    }

    const petsFiltered = pets.filter(
      (pet) => {
        const breed = pet.breed.stringValue.toLowerCase();
        const isMatch = breed.indexOf(searchString.trim().toLowerCase());

        return isMatch !== -1;
      }
    )
    setFilteredPets(petsFiltered);

  }

  const getPets = async() => {
    try {
      const response = await fetch('https://firestore.googleapis.com/v1/projects/it-tf-123/databases/(default)/documents/pets/');
      const data = await response.json();
      console.log(data);
      const formattedData =data.documents.map((item) => {
        return item.fields
      });

      console.log(formattedData);
      setPets(formattedData);
      setFilteredPets(formattedData);
      globalState.initializePets(formattedData);
      setLoading(false);

    } catch(err){
      console.log(err);
      setLoading(false);
    }
  }

  const handleSearchUpdate = (event) => {
    setSearchString(event.target.value) ;
  }

  return (
    <div className="pets-page">
      <h1 className="pets-title">All Pets</h1>
      <Search handleSearchUpdate={handleSearchUpdate}/>
      <div className="pets-container">
        {
          filteredPets.map((pet) => (
            <PetItem key={pet.id.stringValue} image={pet.image.stringValue} name={pet.name.stringValue} breed={pet.breed.stringValue} age=
            {pet.age.stringValue} type={pet.petType.stringValue} id={pet.id.stringValue}></PetItem>
          ))
        }

        {
          !loading && filteredPets.length === 0 && <p>Nothing found for {searchString}!</p>
        }

        {
          loading && <p>Loading data..</p>
        }

      </div>
    </div>
  );
};
