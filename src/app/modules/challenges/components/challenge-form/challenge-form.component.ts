import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addDays } from 'date-fns';
import { filter, map, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ChallengeApi, ChallengeTypeEnumApi } from 'src/app/sdk';
import { ChallengeForm } from '../../models/challenge.form';
import { ChallengesRestService } from '../../services/challenges-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-challenge-form',
  templateUrl: './challenge-form.component.html',
  styleUrls: ['./challenge-form.component.scss'],
})
export class ChallengeFormComponent implements OnInit {
  I18ns = I18ns;
  private fb: IFormBuilder;

  @Input() byTeam: boolean | null = false;

  isEdit = false;

  challengeForm!: IFormGroup<ChallengeForm>;
  editedChallenge!: ChallengeApi;

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly challengeRestService: ChallengesRestService,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((p) => {
          if (p['id'] === 'new') {
            this.initForm();
            return null;
          } else {
            this.isEdit = true;
            return p['id'];
          }
        }),
        filter((x) => !!x),
        switchMap((id) => this.challengeRestService.getChallenge(id)),
        tap((p) => (this.editedChallenge = p)),
        tap((p) => this.initForm(p)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  initForm(challenge?: ChallengeApi, type?: ChallengeTypeEnumApi) {
    this.challengeForm = this.fb.group<ChallengeForm>({
      name: [challenge?.name ?? '', [Validators.required]],
      type: [challenge?.type ?? type ?? ChallengeTypeEnumApi.ByUser, [Validators.required]],
      teams: [challenge?.teams?.map((t) => t.id) ?? [], [Validators.required]],
      guessesPerDay: [challenge?.guessesPerDay ?? 1],
      scoreMinPercent: [challenge?.scoreMinPercent ?? 0],
      startDate: [challenge?.startDate ?? new Date()],
      endDate: [challenge?.endDate ?? addDays(new Date(), 7)],
      reward: [challenge?.reward ?? '', [Validators.required]],
    });
  }
}
