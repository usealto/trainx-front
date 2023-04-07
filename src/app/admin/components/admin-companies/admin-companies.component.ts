import { Component, OnInit } from '@angular/core';
// import { CompaniesRestService } from  'src/app/sdk';


@Component({
  selector: 'alto-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss']
})
export class AdminCompaniesComponent implements OnInit {
  companies: any[] = [];

  // constructor(private readonly companyService: CompaniesRestService) {}

  ngOnInit(): void {
    // this.companies = this.companyService.getCompanies();
    console.log('here');
    
  }

}
