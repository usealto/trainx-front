import { Component, Input, OnInit } from '@angular/core';
import { GuessDtoApi, UserLightDtoApi } from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { filter, map, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { TrainingCardData } from 'src/app/modules/training/models/training.model';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  @Input() pageSize = 2;

  page = 1;

  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  userName = '';

  guessesCount = 0;
  myProgramRunsCards: TrainingCardData[] = [];
  //programs-run data
  continuousSessionUsers: UserLightDtoApi[] = [];

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly guessesRestService: GuessesRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
  ) {}

  ngOnInit(): void {
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(tap((a) => (this.myProgramRunsCards = a.filter((r) => r.isProgress === true))))
      .subscribe();

    this.userName = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';
    this.continuousSessionGetGuessesCount();
  }

  continuousSessionGetGuessesCount() {
    this.guessesRestService
      .getGuesses({
        createdAfter: addDays(new Date(), -1),
        createdBefore: new Date(),
      })
      .pipe(
        map((gs) => gs.data?.filter((g) => !g.programRunId)),
        tap((guesses = []) => {
          const reducedGuesses = [] as GuessDtoApi[];
          guesses.forEach((guess) => {
            if (!reducedGuesses.some((g) => g.createdBy === guess.createdBy)) {
              reducedGuesses.push(guess);
            }
          });
          this.continuousSessionUsers = reducedGuesses.map((g) => g.createdByUser ?? '');
        }),
      )
      .subscribe();
  }

  paginateProgramRuns(page: number) {
    this.page = page;
  }
}
