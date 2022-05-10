const fs = require("fs").promises;
const path = require("path");
const shortid = require("shortid");
const Joi = require("joi");
require("colors");

const schema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  phone: Joi.string().required(),
});

const contactsPath = path.join(__dirname, "./contacts.json");
const UNICODE = "utf8";

async function listContacts() {
  try {
    const contacts = await fs.readFile(contactsPath, UNICODE);
    return JSON.parse(contacts);
  } catch (error) {
    console.log(error);
  }
}

async function getContactById(contactId) {
  const contacts = await listContacts();
  const foundContact = contacts.find(
    (contact) => contact.id === String(contactId)
  );

  if (!foundContact) {
    console.log(`Contact with id - "${contactId}" was not found!`.red);
    return;
  }

  return foundContact;
}

async function removeContact(contactId) {
  const contact = await getContactById(contactId);

  if (!contact) return;

  const contacts = await listContacts();

  const updatedContacts = contacts.filter(
    (contact) => contact.id !== String(contactId)
  );

  try {
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts), UNICODE);
    console.log(`Contact ${contact.name} was deleted!`.green);
  } catch (error) {
    console.log(error);
  }
}

async function addContact(name, email, phone) {
  const value = schema.validate({ name, email, phone });

  if (value?.error) {
    console.log(`ERROR: ${value.error.details[0].message}!`.red);
    return;
  }

  const contacts = await listContacts();

  const newContact = {
    id: shortid.generate(),
    name,
    email,
    phone,
  };

  contacts.push(newContact);

  try {
    await fs.writeFile(contactsPath, JSON.stringify(contacts), UNICODE);
    console.log(`Contact ${newContact.name} was added!`.green);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
