import { Controller, UseGuards, Get, Query, Body, Put, Patch } from '@nestjs/common';
import { CaseFilesStore } from '@dragonfish/api/database/admin/stores';
import { RolesGuard } from '../../guards';
import { Roles } from '@dragonfish/shared/models/users';
import { User } from '@dragonfish/api/utilities/decorators';
import { JwtPayload } from '@dragonfish/shared/models/auth';
import { CaseKind, ReportForm, NoteForm } from '@dragonfish/shared/models/case-files';

@Controller('case-files')
export class CaseFilesController {
    constructor(private readonly caseFilesStore: CaseFilesStore) {}

    @UseGuards(RolesGuard([Roles.Moderator, Roles.Admin]))
    @Get('fetch-active')
    public async fetchActive() {
        return await this.caseFilesStore.fetchAllActive();
    }

    @UseGuards(RolesGuard([Roles.Moderator, Roles.Admin]))
    @Get('fetch-closed')
    public async fetchClosed() {
        return await this.caseFilesStore.fetchAllClosed();
    }

    @UseGuards(RolesGuard([Roles.User]))
    @Put('submit-report')
    public async submitReport(
        @User() user: JwtPayload,
        @Query('itemId') itemId: string,
        @Query('caseKind') caseKind: CaseKind,
        @Body() form: ReportForm,
    ) {
        return await this.caseFilesStore.submitReport(user, itemId, caseKind, form);
    }

    @UseGuards(RolesGuard([Roles.Moderator, Roles.Admin]))
    @Patch('claim-file')
    public async claimFile(@User() user: JwtPayload, @Query('id') id: number) {
        return await this.caseFilesStore.claimFile(user, id);
    }

    @UseGuards(RolesGuard([Roles.Moderator, Roles.Admin]))
    @Patch('revoke-claim')
    public async revokeClaim(@User() user: JwtPayload, @Query('id') id: number) {
        return await this.caseFilesStore.revokeClaim(user, id);
    }

    @UseGuards(RolesGuard([Roles.Moderator, Roles.Admin]))
    @Patch('add-note')
    public async addNote(@User() user: JwtPayload, @Query('id') id: number, @Body() form: NoteForm) {
        return await this.caseFilesStore.addNote(user, id, form);
    }
}
