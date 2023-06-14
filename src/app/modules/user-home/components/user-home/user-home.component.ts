import { Component, Input, OnInit } from '@angular/core';
import { GuessDtoApi, ProgramRunApi } from '@usealto/sdk-ts-angular';
import { getDayOfYear } from 'date-fns';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { TrainingCardData } from 'src/app/modules/training/models/training.model';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { Router } from '@angular/router';
@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  @Input() data: TrainingCardData[] = [];
  @Input() pageSize = 2;
  @Input() programRun!: ProgramRunApi;

  page = 1;

  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  userName = '';

  guessesCount = 0;

  myProgramRunsCards: TrainingCardData[] = [];

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly guessesRestService: GuessesRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(tap((a) => (this.myProgramRunsCards = a)))
      .subscribe();

    this.userName = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';
    this.guessesRestService
      .getGuesses()
      .pipe(
        tap((guesses) => {
          const date = new Date();
          const reducedGuesses = [] as GuessDtoApi[];
          guesses.forEach((guess) => {
            if (
              getDayOfYear(guess.createdAt) === getDayOfYear(date) &&
              !reducedGuesses.some((g) => g.createdBy === guess.createdBy)
            ) {
              reducedGuesses.push(guess);
              this.guessesCount++;
            }
          });
        }),
      )
      .subscribe();
  }

  paginateProgramRuns(page: number) {
    this.page = page;
  }

  goToTraining() {
    const test = this.myProgramRunsCards.map((a) => {
      return a.programRunId;
    });
    const id = test.find((a) => a === test[0]);
    console.log('id ', id);
    this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training, AltoRoutes.trainingSession, `${id}`]);
  }
}
