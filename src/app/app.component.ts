import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import * as _m from 'moment';

const API_URL = 'https://api.cryptonator.com/api/ticker/btc-usd';
const notice = new Audio('../../assets/sounds/notice.mp3');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  dateFormat = 'yyyy-MM-dd HH:mm:ss';
  displayedColumns: string[] = ['date', 'price', 'actions'];
  paginatorSteps = [5, 10, 50, 100];
  dataArray: any = [];
  dataSource = new MatTableDataSource<any>(this.dataArray);
  priceLimit = null;
  interval;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private  httpClient:  HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const t = this;
    t.getNewData();
    this.interval = setInterval(() => {
      t.getNewData();
    }, 10000)
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private getNewData() {
    this.httpClient.get(API_URL)
      .subscribe((data: any) => {
        if (data && data.ticker) {
          this.dataHandler(data.ticker);
        }
    });
  }

  private dataHandler(data: any) {
    if (data.price < this.priceLimit) {
      notice.play();
    }

    let rec = {
      date: new Date(),
      price: data.price,
      edit: false,
      datePick: null,
      timePick: null
    };
    this.dataArray.unshift(rec);
    this.updateTableView(this.dataArray)
  }

  private updateTableView(data) {
    const t = this;

    t.dataSource = new MatTableDataSource<any>(data);
    t.dataSource.paginator = t.paginator;
    t.dataSource.sort = t.sort;
    t.cdRef.detectChanges();
  }

  public removeRow(p) {
    const idx = this.dataSource.data.indexOf(p);
    this.dataArray.splice(idx, 1);
    this.updateTableView(this.dataArray);
  }

  public dateParse(e) {
    if (e.edit && e.date) {
      e.datePick = _m(e.date).toDate();
      e.timePick = _m(e.date).format("hh:mm:ss A");
    } else if (!e.edit) {
      const timeObj = _m(e.timePick, ["hh:mm:ss A"]);
      const m = _m(e.datePick);
      m.set({
        h: Number(timeObj.format("HH")),
        m: Number(timeObj.format("mm")),
        s: Number(timeObj.format("ss"))
      });
      e.date = m.toDate();
    }
  }
}
