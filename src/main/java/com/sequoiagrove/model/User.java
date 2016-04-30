
package com.sequoiagrove.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class User {
    int id;
    int clockNumber;
    int maxHours;
    int minHours;
    String birthDate;
    String fullname;
    String firstname;
    String lastname;
    String email;
    String permissions;
    String classification;

    public User(){}
    public User(int id, int clockNumber, int maxHours, int minHours, String birthDate, String fullname, String firstname, String lastname, String email, String permissions, String classification) {
        this.id = id;
        this.clockNumber = clockNumber;
        this.maxHours = maxHours;
        this.minHours = minHours;
        this.birthDate = birthDate;
        this.fullname = fullname;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.permissions = permissions;
        this.classification = classification;
    }

    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }

    public int getClocknumber() {
        return clockNumber;
    }
    public void setClocknumber(int clockNumber) {
        this.clockNumber = clockNumber;
    }

    public int getMinHours() {
        return minHours;
    }
    public void setMinHours(int minHours) {
        this.minHours = minHours;
    }

    public int getMaxHours() {
        return maxHours;
    }
    public void setMaxHours(int maxHours) {
        this.maxHours = maxHours;
    }

    public String getBirthDate() {
        return birthDate;
    }
    public void setBirthDate(String birthDate) {
      this.birthDate = birthDate;
    }

    public String getFullname() {
        return fullname;
    }
    public void setFullname(String fullname) {
      this.fullname = fullname;
    }

    public String getFirstname() {
        return firstname;
    }
    public void setFirstname(String firstname) {
      this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }
    public void setLastname(String lastname) {
      this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
      this.email = email;
    }

    public void setClassification(String classification) {
        this.classification = classification;
    }
    public String getClassification() {
        return classification;
    }

    public String getPermissions() {
        return permissions;
    }
    public void setPermissions(String permissions) {
      this.permissions = permissions;
    }
}
