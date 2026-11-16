export class ForbiddenError extends Error {
    constructor() {
        super('Für diese Aktion fehlt die Berechtigung.');
    }
}
