import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompanyDtoApi, QuestionDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { NgbdSortableHeaderDirective } from 'src/app/core/utils/directives/ngbd-sortable-header.directive';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { AdminUploadQuestionsModalComponent } from './admin-upload-questions-modal/admin-upload-questions-modal.component';

@Component({
  selector: 'alto-admin-company-questions',
  templateUrl: './admin-company-questions.component.html',
  styleUrls: ['./admin-company-questions.component.scss'],
})
export class AdminCompanyQuestionsComponent implements OnInit {
  @ViewChildren(NgbdSortableHeaderDirective) headers!: QueryList<NgbdSortableHeaderDirective>;
  company!: CompanyDtoApi;
  id: string | undefined;
  questions: QuestionDtoApi[] = [];
  displayedQuestions: QuestionDtoApi[] = [];
  questionsPage = 1;
  questionsPageSize = 20;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly questionsRestService: QuestionsRestService,
    private readonly route: ActivatedRoute,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.fetchAll();
  }
  fetchAll() {
    combineLatest({
      company: this.companiesRestService.getCompanyById(this.id as string),
      questions: this.questionsRestService.getQuestions({ companyId: this.id }),
    })
      .pipe(
        tap(({ company, questions }) => {
          this.company = company;
          this.questions = questions;
          this.changeQuestionsPage(1);
        }),
      )
      .subscribe();
  }

  uploadQuestions() {
    const modalRef = this.modalService.open(AdminUploadQuestionsModalComponent, {
      size: 'xl',
      centered: true,
    });
    modalRef.result.then((res) => {
      if (res === -1) {
        this.toastService.show({ type: 'danger', text: 'Questions upload failed' });
      } else {
        this.fetchAll();
        this.toastService.show({ type: 'success', text: 'Questions uploaded successfully' });
      }
    });
  }

  changeQuestionsPage(page: number) {
    this.questionsPage = page;
    this.displayedQuestions = this.questions.slice(
      (page - 1) * this.questionsPageSize,
      page * this.questionsPageSize,
    );
  }
}
