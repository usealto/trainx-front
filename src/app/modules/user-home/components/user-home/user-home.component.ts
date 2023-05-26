import { Component, OnInit } from '@angular/core';
import { GuessDtoApi } from '@usealto/sdk-ts-angular';
import { getDayOfYear } from 'date-fns';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  userName = '';

  guessesCount = 0;
  constructor(
    private readonly profileStore: ProfileStore,
    private readonly guessesRestService: GuessesRestService,
  ) {}

  ngOnInit(): void {
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
}
