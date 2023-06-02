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

```

```
