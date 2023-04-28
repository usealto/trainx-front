import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  I18ns = I18ns;
  isDev = !environment.production;

  constructor(
    public readonly teamStore: TeamStore,
    public readonly userStore: ProfileStore,
    public readonly programStore: ProgramsStore,
    programRestService: ProgramsRestService,
  ) {
    programRestService.getPrograms().subscribe();
  }
}
