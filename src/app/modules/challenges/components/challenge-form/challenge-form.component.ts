import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { addDays } from 'date-fns';
import { filter, map, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ChallengeApi, ChallengeTypeEnumApi, TeamApi } from 'src/app/sdk';
import { ChallengeForm } from '../../models/challenge.form';
import { ChallengesRestService } from '../../services/challenges-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { NgbCalendar, NgbDate, NgbDateAdapter } from '@ng-bootstrap/ng-bootstrap';

@UntilDestroy()
@Component({
  selector: 'alto-challenge-form',
  templateUrl: './challenge-form.component.html',
  styleUrls: ['./challenge-form.component.scss'],
})
export class ChallengeFormComponent implements OnInit {
  I18ns = I18ns;
  ChallengeTypeEnumApi = ChallengeTypeEnumApi;
  private fb: IFormBuilder;

  isEdit = false;
  defaultType = ChallengeTypeEnumApi.ByUser;

  challengeForm!: IFormGroup<ChallengeForm>;
  editedChallenge!: ChallengeApi;
  teams: TeamApi[] = [];
  // Dates
  hoveredDate!: NgbDate | null;
  fromDate!: NgbDate;
  toDate!: NgbDate | null;

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly teamService: TeamsRestService,
    private readonly challengeRestService: ChallengesRestService,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.teamService
      .getTeams()
      .pipe(
        tap((t) => (this.teams = t)),
        untilDestroyed(this),
      )
      .subscribe();

    this.route.params
      .pipe(
        map((p) => {
          if (p['type'] === 'byTeam') {
            this.defaultType = ChallengeTypeEnumApi.ByTeam;
          }

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

    this.challengeForm.valueChanges.pipe(tap(console.log)).subscribe();
  }

  initForm(challenge?: ChallengeApi) {
    this.challengeForm = this.fb.group<ChallengeForm>({
      name: [challenge?.name ?? '', [Validators.required]],
      type: [challenge?.type ?? this.defaultType, [Validators.required]],
      teams: [challenge?.teams?.map((t) => t.id) ?? [], [Validators.required]],
      guessesPerDay: [challenge?.guessesPerDay ?? 1],
      scoreMinPercent: [challenge?.scoreMinPercent ?? 0],
      startDate: [challenge?.startDate ?? new Date()],
      endDate: [challenge?.endDate ?? addDays(new Date(), 7)],
      reward: [challenge?.reward ?? '', [Validators.required]],
    });

    if (this.challengeForm.controls.startDate.value)
      this.fromDate = this.dateToNgbDate(this.challengeForm.controls.startDate.value);
    if (this.challengeForm.controls.endDate.value)
      this.toDate = this.dateToNgbDate(this.challengeForm.controls.endDate.value);
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    if (this.fromDate) {
      this.challengeForm.controls.startDate.patchValue(this.ngbDateToDate(this.fromDate));
    }
    if (this.toDate) {
      this.challengeForm.controls.endDate.patchValue(this.ngbDateToDate(this.toDate));
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  ngbDateToDate(n: NgbDate): Date {
    return new Date(n.year, n.month, n.day);
  }
  dateToNgbDate(d: Date): NgbDate {
    return new NgbDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
  }
}
