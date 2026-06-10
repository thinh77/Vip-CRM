import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../shared/http.js";
import { createCustomersRepository } from "./customers.repository.js";
import { createCustomersService } from "./customers.service.js";
import {
  validateCustomerImportInput,
  validateCustomerInput,
  validateInteractionInput,
  validateNoteInput
} from "./customers.validation.js";

const repository = createCustomersRepository(pool);
const service = createCustomersService(repository);

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(async (req, res) => {
  const customers = await service.listCustomers({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    manager: typeof req.query.manager === "string" ? req.query.manager : undefined
  });
  res.json(customers);
}));

customersRouter.get("/:id", asyncHandler(async (req, res) => {
  res.json(await service.getCustomer(req.params.id));
}));

customersRouter.post("/import", asyncHandler(async (req, res) => {
  const result = await service.importCustomers(validateCustomerImportInput(req.body));
  res.status(201).json(result);
}));

customersRouter.post("/", asyncHandler(async (req, res) => {
  const customer = await service.createCustomer(validateCustomerInput(req.body));
  res.status(201).json(customer);
}));

customersRouter.put("/:id", asyncHandler(async (req, res) => {
  res.json(await service.updateCustomer(req.params.id, validateCustomerInput(req.body)));
}));

customersRouter.delete("/:id", asyncHandler(async (req, res) => {
  await service.deleteCustomer(req.params.id);
  res.status(204).end();
}));

customersRouter.post("/:id/interactions", asyncHandler(async (req, res) => {
  const interaction = await service.addInteraction(req.params.id, validateInteractionInput(req.body));
  res.status(201).json(interaction);
}));

customersRouter.delete("/:id/interactions/:interactionId", asyncHandler(async (req, res) => {
  await service.deleteInteraction(req.params.id, req.params.interactionId);
  res.status(204).end();
}));

customersRouter.post("/:id/notes", asyncHandler(async (req, res) => {
  const note = await service.addNote(req.params.id, validateNoteInput(req.body));
  res.status(201).json(note);
}));

customersRouter.delete("/:id/notes/:noteId", asyncHandler(async (req, res) => {
  await service.deleteNote(req.params.id, req.params.noteId);
  res.status(204).end();
}));
