import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { API, Storage } from "aws-amplify";
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import { listPrivateNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  createPrivateNote as createPrivateNoteMutation,
  deletePrivateNote as deletePrivateNoteMutation,
} from "./graphql/mutations";

const App = ({ signOut }) => {
  const [notes, setNotes] = useState([]);
  const [PrivateNotes, setPrivateNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
	fetchPrivateNotes();
  }, []);

async function fetchNotes() {
  const apiData = await API.graphql({ query: listNotes, authMode: 'API_KEY'  });
  const notesFromAPI = apiData.data.listNotes.items;
  await Promise.all(
	notesFromAPI.map(async (note) => {
	  if (note.image) {
		const url = await Storage.get(note.name);
		note.image = url;
	  }
	  return note;
	})
  );
  setNotes(notesFromAPI);
}

async function fetchPrivateNotes() {
  const apiData = await API.graphql({ query: listPrivateNotes, authMode: 'AMAZON_COGNITO_USER_POOLS' });
  const notesFromAPI = apiData.data.listPrivateNotes.items;
  await Promise.all(
	notesFromAPI.map(async (PrivateNote) => {
	  if (PrivateNote.image) {
		const url = await Storage.get(PrivateNote.name);
		PrivateNote.image = url;
	  }
	  return PrivateNote;
	})
  );
  setPrivateNotes(notesFromAPI);
}

async function createNote(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const image = form.get("image");
  const data = {
    name: form.get("name"),
    description: form.get("description"),
    image: image.name,
  };
  if (!!data.image) await Storage.put(data.name, image);
  await API.graphql({
    query: createNoteMutation,
    variables: { input: data },
  });
  fetchNotes();
  event.target.reset();
}

async function createPrivateNote(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const image = form.get("image");
  const data = {
    name: form.get("name"),
    description: form.get("description"),
    image: image.name,
  };
  if (!!data.image) await Storage.put(data.name, image);
  await API.graphql({
    query: createPrivateNoteMutation,
    variables: { input: data },
	authMode: 'AMAZON_COGNITO_USER_POOLS'
  });
  fetchPrivateNotes();
  event.target.reset();
}

async function deleteNote({ id, name }) {
  const newNotes = notes.filter((note) => note.id !== id);
  setNotes(newNotes);
  await Storage.remove(name);
  await API.graphql({
    query: deleteNoteMutation,
    variables: { input: { id } },
  });
}

async function deletePrivateNote({ id, name }) {
  const newNotes = PrivateNotes.filter((PrivateNote) => PrivateNote.id !== id);
  setPrivateNotes(newNotes);
  await Storage.remove(name);
  await API.graphql({
    query: deletePrivateNoteMutation,
    variables: { input: { id } },
	authMode: 'AMAZON_COGNITO_USER_POOLS'
  });
}

  return (
    <View className="App">
      <Heading level={1}>My Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
			<View
			  name="image"
			  as="input"
			  type="file"
			  style={{ alignSelf: "end" }}
			/>
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
	  <Heading level={1}>My Private Notes App</Heading>
      <View as="form" margin="3rem 0" onSubmit={createPrivateNote}>
        <Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Note Name"
            label="Note Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Note Description"
            label="Note Description"
            labelHidden
            variation="quiet"
            required
          />
			<View
			  name="image"
			  as="input"
			  type="file"
			  style={{ alignSelf: "end" }}
			/>
          <Button type="submit" variation="primary">
            Create Note
          </Button>
        </Flex>
      </View>
      <Heading level={3}>Current Notes</Heading>
      <View margin="3rem 0">
		 {notes.map((note) => (
		  <Flex
			key={note.id || note.name}
			direction="row"
			justifyContent="center"
			alignItems="center"
		  >
			<Text as="strong" fontWeight={700}>
			  {note.name}
			</Text>
			<Text as="span">{note.description}</Text>
			{note.image && (
			  <Image
				src={note.image}
				alt={`visual aid for ${notes.name}`}
				style={{ width: 400 }}
			  />
			)}
			<Button variation="link" onClick={() => deleteNote(note)}>
			  Delete note
			</Button>
		  </Flex>
		))}
      </View>
	  <Heading level={3}>Current Private Notes</Heading>
      <View margin="3rem 0">
		 {PrivateNotes.map((PrivateNote) => (
		  <Flex
			key={PrivateNote.id || PrivateNote.name}
			direction="row"
			justifyContent="center"
			alignItems="center"
		  >
			<Text as="strong" fontWeight={700}>
			  {PrivateNote.name}
			</Text>
			<Text as="span">{PrivateNote.description}</Text>
			{PrivateNote.image && (
			  <Image
				src={PrivateNote.image}
				alt={`visual aid for ${notes.name}`}
				style={{ width: 400 }}
			  />
			)}
			<Button variation="link" onClick={() => deletePrivateNote(PrivateNote)}>
			  Delete note
			</Button>
		  </Flex>
		))}
      </View>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

export default withAuthenticator(App);