import React, { useRef, useState, useEffect } from 'react';
import Button from './Button';

import styles from './ImageUpload.module.css';

const ImageUpload = (props) => {
  const { id, onInput, errorText, center } = props;

  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);
  const filePickerRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = (event) => {
    //preview file..
    console.log(event.target);
    let pickedFile;
    let fileIsValid;

    if (event.target.files || event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    onInput(id, pickedFile, fileIsValid);
  };

  const pickImageHandler = (event) => {
    filePickerRef.current.click();
  };

  return (
    <div className='form-control'>
      <input
        ref={filePickerRef}
        id={id}
        style={{ display: 'none' }}
        type='file'
        accept='.jpg, .jpeg, .png'
        onChange={pickedHandler}
      />
      <div
        className={[
          styles['image-upload'],
          styles[`${center && 'center'}`],
        ].join(' ')}
      >
        <div className={styles['image-upload__preview']}>
          {previewUrl && <img src={previewUrl} alt='Preview' />}
          {!previewUrl && <p>Please pick an image</p>}
        </div>
        <Button type='button' onClick={pickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && <p>{errorText}</p>}
    </div>
  );
};

export default ImageUpload;
