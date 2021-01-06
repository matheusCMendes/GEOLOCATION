checkin(scheduling: Scheduling, location:Location): Observable<Checkin> {
    let checkin: Checkin = new Checkin();
      checkin.schedulingId = scheduling.id;
      checkin.checkin = moment().format();
      checkin.location = location;
  
    return Observable.fromPromise(this.storage.set(`queue.checkin.${scheduling.id}`, checkin)).map(() => {
      this.processQueues();
      return checkin;
    });
  }

  checkout(scheduling: Scheduling, location:Location): Observable<Checkin> {
    let checkin: Checkin = new Checkin();
    checkin.schedulingId = scheduling.id;
    checkin.checkout = moment().format();
    checkin.location = location;

    return Observable.fromPromise(this.storage.set(`queue.checkout.${scheduling.id}`, checkin)).map(() => {
      this.processQueues();
      return checkin;
    });
  }
  
