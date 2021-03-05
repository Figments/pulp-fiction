import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleResponse } from '@dragonfish/utilities/functions';
import { InviteCodes } from '@dragonfish/models/users';

@Injectable()
export class UserManagementService {
    private url = `/api/user-management`;

    constructor(private http: HttpClient) {}

    public generateCode() {
        return handleResponse(
            this.http.get<InviteCodes>(`${this.url}/generate-code`, {
                observe: 'response', 
                withCredentials: true
            })
        )
    }
}
