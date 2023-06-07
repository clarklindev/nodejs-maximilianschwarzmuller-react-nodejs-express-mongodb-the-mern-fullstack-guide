# Frontend

## Auth

```js
try {
  const response = await fetch('http://localhost:5000/api/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: formState.inputs.name.value,
      email: formState.inputs.email.value,
      password: formState.inputs.password.value,
    }),
  });

  const responseData = await response.json();
  console.log(responseData);
} catch (err) {
  console.log(err);
}
```

## fixing Cross origin resource sharing (CORS errors)

- needs to be run on same domain, to fix by adjusting headers using cors

## Hiding google api key

- store the key in .env on server
- create an endpoint to handle requests from frontend and return data via server endpoint

## FormData with image binary data

```js
const formData = new FormData(); //we can attach text and binary data to formdata
formData.append('email', formState.inputs.email.value);
formData.append('name', formState.inputs.name.value);
formData.append('password', formState.inputs.password.value);
formData.append('image', formState.inputs.image.value);
const responseData = await sendRequest(
  'http://localhost:5000/api/users/signup',
  'POST',

  // JSON.stringify({
  //   name: formState.inputs.name.value,
  //   email: formState.inputs.email.value,
  //   password: formState.inputs.password.value,
  // }),

  //because we are adding image data, we use FormData - and NB... it automatically adds the form headers
  formData
);
```

## Delete file from server

```js
//app.js
// handler for all previous middleware yielding errors
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    }); //use file system to delete file off server.
    //we get a callback when delete is done (err)=>{} - you get err if there is an error
  }
});
```

## when uploading a file to server, to gain access to file via api

- specify while files in which folder to return

```js
const path = require('path');
app.use('/uploads/images/', express.static(path.join('uploads', 'images'))); //only files in uploads/images are returned...
```
